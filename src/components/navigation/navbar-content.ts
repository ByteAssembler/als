export const navbarContent = {
	de: [
		{
			id: 43,
			href: "#hero",
			withLanguagePrefix: true,
			text: "Startseite",
		},
		{
			id: 75,
			href: "#blogs",
			withLanguagePrefix: true,
			text: "Forschung & Austausch",
		},
		{
			id: 46,
			href: "#map",
			withLanguagePrefix: true,
			text: "Karte",
		},
		{
			id: 80,
			href: "#promis",
			withLanguagePrefix: true,
			text: "Promis",
		},
		{
			id: 47,
			href: "#about",
			withLanguagePrefix: true,
			text: "Über uns",
		},
		{
			id: 48,
			href: "media",
			withLanguagePrefix: true,
			text: "Medien",
		},
		{
			id: 71,
			href: "links",
			withLanguagePrefix: true,
			text: "Link",
		},
	],
	en: [
		{
			id: 50,
			href: "#hero",
			withLanguagePrefix: true,
			text: "Home",
		},
		{
			id: 76,
			href: "#blogs",
			withLanguagePrefix: true,
			text: "Research & Exchange",
		},
		{
			id: 53,
			href: "#map",
			withLanguagePrefix: true,
			text: "Map",
		},
		{
			id: 81,
			href: "#promis",
			withLanguagePrefix: true,
			text: "Celebs",
		},
		{
			id: 54,
			href: "#about",
			withLanguagePrefix: true,
			text: "About us",
		},
		{
			id: 55,
			href: "media",
			withLanguagePrefix: true,
			text: "Media",
		},
		{
			id: 72,
			href: "links",
			withLanguagePrefix: true,
			text: "Link",
		},
	],
	it: [
		{
			id: 57,
			href: "#hero",
			withLanguagePrefix: true,
			text: "Home",
		},
		{
			id: 74,
			href: "#blogs",
			withLanguagePrefix: true,
			text: "Ricerca e Scambio",
		},
		{
			id: 60,
			href: "#map",
			withLanguagePrefix: true,
			text: "Mappa",
		},
		{
			id: 82,
			href: "#promis",
			withLanguagePrefix: true,
			text: "Celebrità",
		},
		{
			id: 61,
			href: "#about",
			withLanguagePrefix: true,
			text: "Chi siamo",
		},
		{
			id: 62,
			href: "media",
			withLanguagePrefix: true,
			text: "Media",
		},
		{
			id: 70,
			href: "links",
			withLanguagePrefix: true,
			text: "Link",
		},
	],
} as const;

export type NavbarItem = (typeof navbarContent)[keyof typeof navbarContent][number];
