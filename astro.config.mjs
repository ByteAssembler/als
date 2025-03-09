import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
  ],
  output: "server",
  adapter: netlify(),

  i18n: {
    locales: ["de", "it", "en"],
    defaultLocale: "de",
  },
  middleware: "./src/middleware.ts",
});

// import en from './locales/en.json';
// import de from './locales/de.json';

// export const translations = { en, de };
