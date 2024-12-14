// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	output: "server",
	site: "https://example.com",
	integrations: [
		sitemap(),
		tailwind({
			// applyBaseStyles: false,
		}),
		react()
	],
	server: {
		port: 3000
	}
});
