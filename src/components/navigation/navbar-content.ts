export const navbarContent = {
	de: [
		{
			id: 43,
			href: "#hero",
			onLanguageSlug: true,
			text: "Startseite",
		},
		{
			id: 45,
			href: "#events",
			onLanguageSlug: true,
			text: "Veranstaltungen",
		},
		{
			id: 46,
			href: "#map",
			onLanguageSlug: true,
			text: "Karte",
		},
		{
			id: 47,
			href: "#about",
			onLanguageSlug: true,
			text: "Über uns",
		},
		{
			id: 48,
			href: "media",
			onLanguageSlug: true,
			text: "Medien",
		},
		{
			id: 71,
			href: "links",
			onLanguageSlug: true,
			text: "Link",
		},
		{
			id: 75,
			href: "#blogs",
			onLanguageSlug: true,
			text: "Forschung & Austausch",
		},
		{
			id: 80,
			href: "#promis",
			onLanguageSlug: true,
			text: "Promis",
		},
	],
	en: [
		{
			id: 50,
			href: "#hero",
			onLanguageSlug: true,
			text: "Home",
		},
		{
			id: 52,
			href: "#events",
			onLanguageSlug: true,
			text: "Events",
		},
		{
			id: 53,
			href: "#map",
			onLanguageSlug: true,
			text: "Map",
		},
		{
			id: 54,
			href: "#about",
			onLanguageSlug: true,
			text: "About us",
		},
		{
			id: 55,
			href: "media",
			onLanguageSlug: true,
			text: "Media",
		},
		{
			id: 72,
			href: "links",
			onLanguageSlug: true,
			text: "Link",
		},
		{
			id: 76,
			href: "#blogs",
			onLanguageSlug: true,
			text: "Research & Exchange",
		},
		{
			id: 81,
			href: "#promis",
			onLanguageSlug: true,
			text: "Celebs",
		},
	],
	it: [
		{
			id: 57,
			href: "#hero",
			onLanguageSlug: true,
			text: "Home",
		},
		{
			id: 59,
			href: "#events",
			onLanguageSlug: true,
			text: "Eventi",
		},
		{
			id: 60,
			href: "#map",
			onLanguageSlug: true,
			text: "Mappa",
		},
		{
			id: 61,
			href: "#about",
			onLanguageSlug: true,
			text: "Chi siamo",
		},
		{
			id: 62,
			href: "media",
			onLanguageSlug: true,
			text: "Media",
		},
		{
			id: 70,
			href: "links",
			onLanguageSlug: true,
			text: "Link",
		},
		{
			id: 74,
			href: "#blogs",
			onLanguageSlug: true,
			text: "Ricerca e Scambio",
		},
		{
			id: 82,
			href: "#promis",
			onLanguageSlug: true,
			text: "Celebrità",
		},
	],
};

export type NavbarItem = typeof navbarContent[keyof typeof navbarContent][number];
