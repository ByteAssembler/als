import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

export default defineConfig({
	site: "http://7.tcp.eu.ngrok.io:18524",
	integrations: [tailwind(), react()],
	output: "server",
	adapter: netlify(),

	i18n: {
		locales: ["de", "it", "en"],
		defaultLocale: "de",
	},
	middleware: "./src/middleware.ts",
	server: {
		allowedHosts: [
			"7.tcp.eu.ngrok.io:18524",
			"7.tcp.eu.ngrok.io"
		]
	}
});

// import en from './locales/en.json';
// import de from './locales/de.json';

// export const translations = { en, de };
