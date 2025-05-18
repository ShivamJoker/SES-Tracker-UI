import { Show, createEffect, createSignal, onMount } from "solid-js";
import toast from "solid-toast";
import Input from "~/components/Input";
import { LoginSearchParam } from "~/types/auth";
import {
  Navigate,
  useIsRouting,
  useLocation,
  useSearchParams,
} from "@solidjs/router";
import { Amplify } from "aws-amplify";
import * as auth from "aws-amplify/auth";

const Login = () => {
  const isRouting = useIsRouting();
  const [searchParams] = useSearchParams<LoginSearchParam>();
  const { email, password, reset, redirectTo } = searchParams;

  const [isLoading, setIsLoading] = createSignal(true);
  const [requiresNewPasswd, setRequiresNewPasswd] = createSignal(false);

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formEl);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const newPassword = formData.get("new-password")?.toString();

    if (!email?.trim() || !password?.trim()) {
      throw "Email and password is required";
    }
    /*     if (!requiresNewPasswd()) {
      // return loginToUser(email, password);
    }
    if (!newPassword?.trim()) {
      throw "A new generated password is required";
    } */

    // const res = await auth.signUp({
    //   username: email,
    //   password,
    //   options: {
    //     userAttributes: {
    //       email: email,
    //     },
    //   },
    // });
    const res = await auth.signIn({ username: email, password });
    console.log(res);

    setIsLoading(false);
  };

  onMount(async () => {
    console.log("got mounted");

    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: "us-east-1_MdznJ7yRX",
          userPoolClientId: "1fka12s32htekbsstt768cbkpp",
        },
      },
    });
    console.log();
    // console.log(auth);

    // auth.setupUserPool();
    // automatically login them for resetting password
    if (reset) {
      // return loginToUser(email!, password!);
    }

    // only try to get current session if use was logged in before
    // const hasPreviousCreds = localStorage.getItem(
    // `CognitoIdentityServiceProvider.${auth.CognitoClientId}.LastAuthUser`,
    // );

    // if (!hasPreviousCreds) {
    //   setIsLoading(false);
    //   return;
    // }
    // Get the current user if any
    /* auth
      .getCurrentUserSession()
      .then((session) => {
        handleAuthSuccess(session);
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
        toast.error(err?.message);
      }); */
  });

  return (
    <>
      <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2>Login to SES Tracker</h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[300px]">
          <form onSubmit={handleLogin} class="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={email ?? ""}
              autocomplete="email"
              required
              placeholder="ethan@hunt.io"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="Your password"
              rightLink="/forgot-pass"
              rightLabel="Forgot password?"
              value={password ?? ""}
              disabled={requiresNewPasswd()}
              required
              class="block mt-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />

            <div>
              <button type="submit">
                {isRouting() ? "Loading ..." : "Login"}
              </button>
            </div>
          </form>

          <p class="mt-10 text-center text-sm text-gray-500">
            Don't have an account? <a href="/register">Register for free</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
