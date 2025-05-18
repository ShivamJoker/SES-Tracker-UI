import "~/styles/new.css";
import "~/styles/index.css";
import "virtual:uno.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal, onMount, Suspense } from "solid-js";
import Nav from "~/components/Nav";
import { Toaster } from "solid-toast";
import { Amplify } from "aws-amplify";

export const [isLoggedIn, setIsLoggedIn] = createSignal(false);

import * as auth from "aws-amplify/auth";
import { API } from "./utils/api";

export default function App() {
  onMount(async () => {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: "us-east-1_MdznJ7yRX",
          userPoolClientId: "1fka12s32htekbsstt768cbkpp",
        },
      },
    });
    try {
      const res = await auth.fetchAuthSession();
      console.log("user is logged in");
      setIsLoggedIn(true);
      API.auth(`Bearer ${res.tokens?.accessToken.toString()}`);
    } catch (err) {
      console.log(err);
    }
  });

  return (
    <Router
      root={(props) => (
        <>
          <Nav />
          <Toaster
            containerStyle={{ "margin-left": "250px" }}
            toastOptions={{
              position: "top-center",
            }}
          />
          <main class="max-w-[1280px]  mx-auto pt-12 px-4 max-h-screen overflow-scroll">
            <Suspense>{props.children}</Suspense>
          </main>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
