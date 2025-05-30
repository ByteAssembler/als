import type { AppTranslationSchema } from "./en";

export const deTranslations: AppTranslationSchema = {
	pages: {
		books: {
			book: {
				"[bookid]": {
					bookNotFound: "Buch nicht gefunden",
					links: "Links",
					backToOverview: "← Zurück zur Übersicht"
				}
			},
		},
		blog: {
			"[slug]": {
				update: "Aktualisiert am",
				backToOverview: "← Zurück zur Übersicht",
			}
		},
		homepage: {
			wellcome: {
				title: "Wir kämpfen gemeinsam gegen ALS",
				subtitle: "Begleite uns in diesem starken Kampf",
				learnMore: "Mehr erfahren",
			},
			research: {
				title: "Forschung & Austausch",
			},
			aboutUs: {
				title: "Über uns",
				content: 'Das „Collegium vincere ALS“ ist ein Verein, der sich dem Kampf gegen die Amyotrophe Lateralsklerose (ALS), eine chronisch degenerative Erkrankung des motorischen Nervensystems, verschrieben hat.<br><br>Wir sehen ALS als „Krankheit der tausend Abschiede“ und wollen Betroffene und ihre Familien in dieser schweren Zeit unterstützen.<br><br>Zu unseren Zielen gehören die umfassende Betreuung von Patienten, die Sensibilisierung der Öffentlichkeit für ALS, die Vernetzung relevanter Akteure und die Förderung der ALS-Forschung. <br><br>Mit Initiativen wie Informationstischen und unserem mobilen ALS-Kit wollen wir die Öffentlichkeit aufklären und Spenden sammeln, um Forschungsprojekte zu unterstützen und die Lebensqualität der Betroffenen zu verbessern.<br><br>Wenn Sie Fragen haben, Hilfe brauchen oder unsere Arbeit unterstützen möchten, nehmen Sie bitte Kontakt auf - denn Ihre Lebensqualität ist uns wichtig!'
			},
			map: {
				title: "Wo Sie Hilfe finden",
				allcategories: "Alle Kategorien",
			},
			promis: {
				title: "Prominente ALS-Kämpfer",
				age: "Alte  r",
				diagnosis: "Diagnose",
			},
			contact: {
				title: "Kontaktieren Sie uns",
				subtitle: "Wir sind für Sie da. Zögern Sie nicht, uns zu kontaktieren.",
				aside: {
					address: "Adresse",
					PEC: "PEC",
					alternativeEmail: "Alternative E-Mail",
					mobile: "Mobil",
					iban: "IBAN für Spende",
					taxNumber: "Steuernummer",
				},
				form: {
					title: "Kontaktformular",
					concern: "Anliegen",
					concernPlaceholder: "Ihr Anliegen",
					message: "Nachricht",
					messagePlaceholder: "Ihre Nachricht",
					submit: "Nachricht senden",
				},
			}
		},
		media: {
			title: "Medien",
			books: {
				title: "Bücher",
				link: "Zur Bücher-Seite"
			},
			audios: {
				title: "Audios",
				empty: "Keine Audios vorhanden."
			},
			images: {
				title: "Bilder",
				empty: "Keine Bilder vorhanden."
			},
			information: {
				title: "Informationen",
				empty: "Keine Informationen vorhanden."
			},
			download: "Herunterladen",
			openInNewTab: "In neuem Tab",
			close: "Schließen",
			audioNotSupported: "Dein Browser unterstützt den Audio-Tag nicht.",
			videoNotSupported: "Dein Browser unterstützt den Video-Tag nicht.",
			previewNotAvailable: "Vorschau nicht verfügbar.",
			openFile: "Datei hier öffnen"
		},
		links: {
			title: "Nützliche Links für Betroffene, Angehörige und Interessierte",
			description1: "Diese Webseite bietet umfassende Informationen über ALS, Symptome und Behandlungsmöglichkeiten.",
			description2: "Unterstützungsnetzwerke und Beratungsangebote für Betroffene und Angehörige."
		}
	},
	cookieBanner: {
		message: "Diese Website verwendet Cookies. Mehr Infos in unserer ",
		privacyLinkText: "Datenschutzerklärung",
		dontShowAgain: "Dieses Banner in Zukunft nicht mehr anzeigen",
		acceptAll: "Alle akzeptieren",
		acceptEssential: "Nur essenzielle akzeptieren",
	},
	footer: {
		legalNotice: "Alle Rechte vorbehalten",
		imprint: "Impressum",
		adminPanel: "Admin-Panel",
	}
}
