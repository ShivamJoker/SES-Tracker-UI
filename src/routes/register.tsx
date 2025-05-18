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
import Button from "~/components/Button";

const Login = () => {
  const isRouting = useIsRouting();
  const [searchParams] = useSearchParams<LoginSearchParam>();

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
      <div class="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
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
              disabled={requiresOtp()}
              required
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
              <Button
                isLoading={isLoading()}
                type="submit"
                class=""
                title="Create account"
              />
            </div>
          </form>

          <p class="mt-10 text-center text-sm text-gray-500">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
