import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

export default defineConfig({
	site: "https://smx71k4f-4321.euw.devtunnels.ms",
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
			"7.tcp.eu.ngrok.io",
			"smx71k4f-4321.euw.devtunnels.ms"
		]
	}
});

// import en from './locales/en.json';
// import de from './locales/de.json';

// export const translations = { en, de };
