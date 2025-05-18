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
import { nanoid } from "nanoid";
import { effect } from "solid-js/web";
import { API } from "~/utils/api";

const Login = () => {
  const isRouting = useIsRouting();
  const [searchParams] = useSearchParams<LoginSearchParam>();

  const [isLoading, setIsLoading] = createSignal(false);
  const [formData, setFormData] = createSignal(
    {
      aws_account_id: "",
      sts_role_arn: "",
      sts_external_id: "",
    },
    { equals: false },
  );

  onMount(async () => {
    setIsLoading(true);
    const attr = await auth.fetchUserAttributes();

    setFormData({
      aws_account_id: attr["custom:aws_account_id"] ?? "",
      sts_role_arn: attr["custom:sts_role_arn"] ?? "",
      sts_external_id: attr["custom:sts_external_id"] ?? nanoid(),
    });

    setIsLoading(false);
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const customAttr: Record<`custom:${string}`, string> = {};
      type AttrNames = keyof ReturnType<typeof formData>;
      for (const name in formData()) {
        customAttr[`custom:${name}`] = formData()[name as AttrNames];
      }
      await auth.updateUserAttributes({
        userAttributes: { ...customAttr },
      });
      await auth.fetchAuthSession({ forceRefresh: true });
    } catch (err) {
      const error = err as Error;
      console.log(error);
      toast.error(
        `Failed to update your account.
Error: ${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateCreds = async () => {
    const res = await auth.fetchAuthSession();
    API.auth(`Bearer ${res.tokens?.accessToken.toString()}`)
      .url("/verify-sts")
      .get();
  };

  return (
    <>
      <div class="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <h2>Account settings</h2>

        <div class="mt-10 sm:w-full sm:max-w-[300px]">
          <form onSubmit={handleSubmit} class="space-y-4">
            <Input
              label="AWS Account ID"
              name="aws_account_id"
              type="number"
              value={formData().aws_account_id}
              onChange={(e) =>
                setFormData({
                  ...formData(),
                  aws_account_id: e.currentTarget.value,
                })
              }
              placeholder="205979422636"
              required
            />

            <Input
              label="IAM Role ARN"
              name="sts_role_arn"
              placeholder="arn::xyz"
              value={formData().sts_role_arn}
              onChange={(e) =>
                setFormData({
                  ...formData(),
                  sts_role_arn: e.currentTarget.value,
                })
              }
              required
            />

            <Input
              label="STS External ID"
              name="sts_external_id"
              placeholder="External id for security"
              value={formData().sts_external_id}
              required
              disabled
            />

            <div>
              <button type="submit" disabled={isLoading()}>
                {isLoading() ? "Updating ..." : "Update"}
              </button>
            </div>
          </form>
          <button onClick={validateCreds}>Validate & Connect Account</button>
        </div>
      </div>
    </>
  );
};

export default Login;
