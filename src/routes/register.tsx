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
import * as auth from "aws-amplify/auth";

const Login = () => {
  const isRouting = useIsRouting();
  const [searchParams] = useSearchParams<LoginSearchParam>();
  const { email, password, reset, redirectTo } = searchParams;

  const [isLoading, setIsLoading] = createSignal(false);
  const [requiresOtp, setRequiresOtp] = createSignal(false);

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formEl);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const otp = formData.get("otp")?.toString();

    if (!email?.trim() || !password?.trim()) {
      throw Error("Email and password is required");
    }

    try {
      setIsLoading(true);

      if (requiresOtp()) {
        if (!otp) {
          throw Error("No OTP provided");
        }
        await auth.confirmSignUp({ username: email, confirmationCode: otp });
        setIsLoggedIn(true);
        return;
      }

      const res = await auth.signUp({
        username: email,
        password,
        options: {
          autoSignIn: { authFlowType: "USER_AUTH" },
          userAttributes: {
            email: email,
          },
        },
      });

      console.log(res);
      if (res.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        toast.success("OTP sent to your email");
        setRequiresOtp(true);
      }
    } catch (err) {
      const error = err as Error;
      console.log(error);
      toast.error(
        `Failed to create your account.
Error: ${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 class="mt-10 text-center text-xl font-bold tracking-tight text-gray-900">
            Create your Amazon SES Tracker Account
          </h2>
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
              disabled={requiresOtp()}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="Your password"
              value={password ?? ""}
              disabled={requiresOtp()}
              required
              class="block mt-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />

            <Show when={requiresOtp()}>
              <Input
                label="OTP"
                name="otp"
                type="number"
                placeholder="6 digit code"
                required
              />
            </Show>

            <div>
              <button
                type="submit"
                class="flex mt-6 w-full justify-center rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold leading-6 text-black shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 whitespace-pre-wrap"
              >
                {isRouting() || isLoading() ? "Loading ..." : "Create Account"}
              </button>
            </div>
          </form>

          <p class="mt-10 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              class="font-semibold leading-6 text-blue-600 hover:text-blue-500"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
