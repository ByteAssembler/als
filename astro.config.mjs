import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

export default defineConfig({
  integrations: [tailwind()],
  output: "static",
  adapter: netlify(),
  integrations: [react()],
});
