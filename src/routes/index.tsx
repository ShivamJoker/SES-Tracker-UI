import { A } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import Counter from "~/components/Counter";
import OtpFieldInput from "~/components/OtpFieldInput";

import * as auth from "aws-amplify/auth";
import { isLoggedIn } from "~/app";
import { API } from "~/utils/api";

export default function Home() {
  onMount(async () => {
    /*    await auth.updateUserAttribute({
      userAttribute: {
        attributeKey: "custom:aws_account_id",
        value: "205979422636",
      },
    }); */
  });
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1>Hello there</h1>
      <OtpFieldInput />
    </main>
  );
}
