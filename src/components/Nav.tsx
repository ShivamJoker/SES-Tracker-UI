import { redirect, useLocation, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";

import * as auth from "aws-amplify/auth";
import Button from "./Button";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLogginOut] = createSignal(false);

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

      <div class="bottom-2 absolute right-0 left-0 p-4">
        <Button
          isLoading={isLoggingOut()}
          class="bg-gray-600 text-white"
          onClick={async () => {
            setIsLogginOut(true);
            await auth.signOut();
            setIsLogginOut(false);
            navigate("/login");
          }}
          title="Log out"
        />
      </div>
    </nav>
  );
}
