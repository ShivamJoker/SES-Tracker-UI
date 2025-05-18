import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";

export default defineConfig({
  server: {
    /* prerender: {
      crawlLinks: true,
      routes: [
        "/",
        "/login",
        "/register",
        "/new-mail",
        "/dashbaord",
        "/events",
        "/supression",
      ],
    }, */
  },
  vite: {
    plugins: [UnoCSS()],
  },
});
