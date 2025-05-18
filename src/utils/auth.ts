import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
  ISignUpResult,
} from "amazon-cognito-identity-js";
import { createSignal, createRoot } from "solid-js";
import { isServer } from "solid-js/web";

// Constants for Cognito
const USER_POOL_ID = "us-east-1_MdznJ7yRX";
const CLIENT_ID = "1fka12s32htekbsstt768cbkpp";

// Create root-level signals for auth state
const createAuthStore = () => {
  const [userPool, setUserPool] = createSignal<CognitoUserPool | null>(null);
  const [cognitoUser, setCognitoUser] = createSignal<CognitoUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [requiresNewPassword, setRequiresNewPassword] = createSignal(false);

  // Initialize the user pool
  const initializePool = () => {
    try {
      if (!userPool()) {
        const pool = new CognitoUserPool({
          UserPoolId: USER_POOL_ID,
          ClientId: CLIENT_ID,
        });
        setUserPool(pool);
        return pool;
      }
      return userPool();
    } catch (err) {
      setError(
        `Failed to initialize Cognito: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  };

  // Get current user from pool if available
  const getCurrentUser = () => {
    const pool = userPool() || initializePool();
    if (!pool) return null;

    try {
      const user = pool.getCurrentUser();
      if (user) {
        setCognitoUser(user);
      }
      return user;
    } catch (err) {
      setError(
        `Failed to get current user: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  };

  // Set up a specific user by username
  const setupUser = (username: string) => {
    const pool = userPool() || initializePool();
    if (!pool) return null;

    try {
      const user = new CognitoUser({
        Username: username,
        Pool: pool,
      });
      setCognitoUser(user);
      return user;
    } catch (err) {
      setError(
        `Failed to setup user: ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  };

  // Get the current session if the user is logged in
  const getCurrentSession = (): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
      const user = cognitoUser() || getCurrentUser();
      if (!user) {
        return reject(new Error("No user found"));
      }

      user.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          if (err) {
            setError(err.message);
            reject(err);
          } else if (session?.isValid()) {
            updateTokens(session);
            setIsAuthenticated(true);
            resolve(session);
          } else {
            setError("Session is not valid");
            reject(new Error("Session is not valid"));
          }
        },
      );
    });
  };

  // Store tokens in cookies for later use
  const updateTokens = (session: CognitoUserSession) => {
    try {
      const idToken = session.getIdToken();
      const jwtToken = idToken.getJwtToken();
      const refreshToken = session.getRefreshToken().getToken();
      document.cookie = `JwtToken=${jwtToken};max-age=${idToken.getExpiration()};path=/`;
      document.cookie = `RefreshToken=${refreshToken};max-age=${60 * 60 * 24 * 30};path=/`; // 30 days
    } catch (err) {
      setError(
        `Failed to update tokens: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  // Login function
  const login = (
    username: string,
    password: string,
  ): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);
      setRequiresNewPassword(false);

      const user = setupUser(username);
      if (!user) {
        setIsLoading(false);
        return reject(new Error("Failed to set up user"));
      }

      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      user.authenticateUser(authDetails, {
        onSuccess: (session) => {
          updateTokens(session);
          setIsAuthenticated(true);
          setIsLoading(false);
          resolve(session);
        },
        onFailure: (err) => {
          setError(err.message);
          setIsLoading(false);
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required scenario
          setRequiresNewPassword(true);
          setIsLoading(false);
          // We don't reject here because the user might want to complete the challenge
        },
      });
    });
  };

  // Complete new password challenge
  const completeNewPasswordChallenge = (
    newPassword: string,
  ): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      const user = cognitoUser();
      if (!user) {
        setIsLoading(false);
        setError("No user found");
        return reject(new Error("No user found"));
      }

      user.completeNewPasswordChallenge(
        newPassword,
        {},
        {
          onSuccess: (session) => {
            updateTokens(session);
            setIsAuthenticated(true);
            setRequiresNewPassword(false);
            setIsLoading(false);
            resolve(session);
          },
          onFailure: (err) => {
            setError(err.message);
            setIsLoading(false);
            reject(err);
          },
        },
      );
    });
  };

  // Sign up a new user
  const signUp = (
    username: string,
    password: string,
    attributes: Record<string, string>,
  ): Promise<ISignUpResult> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      const pool = userPool() || initializePool();
      if (!pool) {
        setIsLoading(false);
        return reject(new Error("Failed to initialize user pool"));
      }

      const attributeList = Object.entries(attributes).map(
        ([key, value]) => new CognitoUserAttribute({ Name: key, Value: value }),
      );

      pool.signUp(username, password, attributeList, [], (err, result) => {
        setIsLoading(false);

        if (err) {
          setError(err.message);
          reject(err);
        } else if (result) {
          // Set up the user after successful signup
          setupUser(username);
          resolve(result);
        } else {
          setError("Unknown error during signup");
          reject(new Error("Unknown error during signup"));
        }
      });
    });
  };

  // Confirm signup (verification code)
  const confirmSignUp = (username: string, code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const user = setupUser(username);
      if (!user) {
        setIsLoading(false);
        return reject(new Error("Failed to set up user"));
      }

      user.confirmRegistration(
        code,
        true, // Force alias creation
        (err, result) => {
          setIsLoading(false);

          if (err) {
            setError(err.message);
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  };

  // Resend confirmation code
  const resendConfirmationCode = (username: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const user = setupUser(username);
      if (!user) {
        setIsLoading(false);
        return reject(new Error("Failed to set up user"));
      }

      user.resendConfirmationCode((err, result) => {
        setIsLoading(false);

        if (err) {
          setError(err.message);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  // Forgot password flow
  const forgotPassword = (username: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const user = setupUser(username);
      if (!user) {
        setIsLoading(false);
        return reject(new Error("Failed to set up user"));
      }

      user.forgotPassword({
        onSuccess: () => {
          setIsLoading(false);
          resolve();
        },
        onFailure: (err) => {
          setError(err.message);
          setIsLoading(false);
          reject(err);
        },
      });
    });
  };

  // Confirm forgot password (with verification code)
  const confirmForgotPassword = (
    username: string,
    code: string,
    newPassword: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      const user = setupUser(username);
      if (!user) {
        setIsLoading(false);
        return reject(new Error("Failed to set up user"));
      }

      user.confirmPassword(code, newPassword, {
        onSuccess: () => {
          setIsLoading(false);
          resolve();
        },
        onFailure: (err) => {
          setError(err.message);
          setIsLoading(false);
          reject(err);
        },
      });
    });
  };

  // Sign out the user
  const signOut = () => {
    try {
      const user = cognitoUser() || getCurrentUser();
      if (user) {
        user.signOut();
      }

      // Clear cookies
      document.cookie = "JwtToken=;max-age=0;path=/";
      document.cookie = "RefreshToken=;max-age=0;path=/";

      // Reset state
      setCognitoUser(null);
      setIsAuthenticated(false);
      setRequiresNewPassword(false);
    } catch (err) {
      setError(
        `Failed to sign out: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  // Initialize on client
  const initialize = async () => {
    const pool = initializePool();
    if (!pool) return;

    // Try to get session if user exists
    const user = getCurrentUser();
    if (user) {
      try {
        await getCurrentSession();
      } catch (err) {
        // Session is invalid, handle silently
        console.log("No valid session found");
      }
    }
  };

  return {
    // State
    userPool,
    cognitoUser,
    isAuthenticated,
    isLoading,
    error,
    requiresNewPassword,

    // Actions
    initialize,
    login,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    completeNewPasswordChallenge,
    signOut,
    getCurrentSession,
  };
};

// Create a singleton store using createRoot
const AuthStore = createRoot(createAuthStore);

export default AuthStore;

if (!isServer) {
  AuthStore.initialize();
}
