import { redirect, useLocation } from "@solidjs/router";
import { Show } from "solid-js";

import * as auth from "aws-amplify/auth";
import { setIsLoggedIn, isLoggedIn } from "~/app";
import { effect } from "solid-js/web";

export default function Nav() {
  const location = useLocation();

  effect(() => {
    console.log(isLoggedIn());
  });

  const active = (path: string) => (path == location.pathname ? "active" : "");

  return (
    <nav class="">
      <ul class="">
        <li class={active("/dashboard")}>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li class={active("/events")}>
          <a href="/events">Events</a>
        </li>

        <li class={active("/suppression")}>
          <a href="/suppression">Suppression List</a>
        </li>

        <li class={active("/new-mail")}>
          <a href="/new-mail">New Email</a>
        </li>
        <li class={active("/settings/account")}>
          <a href="/settings/account">AWS Settings</a>
        </li>
      </ul>

      <Show when={true}>
        <div class="bottom-2 absolute right-0 left-0 p-4">
          <button
            class="bg-gray-600 text-white"
            onClick={async () => {
              await auth.signOut();

              console.log("logout");
              redirect("/login");
              setIsLoggedIn(false);
            }}
          >
            Log out
          </button>
        </div>
      </Show>
    </nav>
  );
}
