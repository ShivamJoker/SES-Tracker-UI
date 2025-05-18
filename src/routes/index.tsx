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
    <section class="">
      <h1>Planning to send some emails today?</h1>

      <div class="max-w-[200px] mt-4">
        <a href="/register">
          <button>Get started today</button>
        </a>
      </div>
    </section>
  );
}
