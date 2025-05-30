export type AppTranslationSchema = typeof enTranslations;

export const enTranslations = {
	pages: {
		books: {
			book: {
				"[bookid]": {
					bookNotFound: "Book not found",
					links: "Links",
					backToOverview: "← Back to overview"
				}
			},
		},
		blog: {
			"[slug]": {
				update: "Updated on",
				backToOverview: "← Back to overview"
			}
		},
		homepage: {
			wellcome: {
				title: "We fight together against ALS",
				subtitle: "Join us in this strong fight",
				learnMore: "Learn more",
			},
			aboutUs: {
				title: "About us",
				content: 'The “Collegium vincere ALS” is an association dedicated to the fight against amyotrophic lateral sclerosis (ALS), a chronic degenerative disease of the motor nervous system.<br><br>We see ALS as a “disease of a thousand goodbyes” and aim to support those affected and their families during this difficult time.<br><br>Our goals include providing comprehensive care for patients, raising public awareness about ALS, building networks among relevant stakeholders, and promoting ALS research.<br><br>Through initiatives such as informational tables and our mobile ALS kit, we aim to educate the public and raise donations to support research projects and improve the quality of life for those affected.<br><br>If you have questions, need help, or would like to support our work, please get in touch - because your quality of life matters to us!',
				imageCaption: "Head of the Association: Gerd Steger",
			},
			research: {
				title: "Research & Exchange",
			},
			map: {
				title: "Where you can find help",
				allcategories: "All categories",
			},
			promis: {
				title: "Prominent ALS fighters",
				age: "Age",
				diagnosis: "Diagnosis",
			},
			contact: {
				title: "Contact us",
				subtitle: "We are here for you. Don't hesitate to reach out to us.",
				aside: {
					address: "Address",
					PEC: "PEC",
					alternativeEmail: "Alternative Email",
					mobile: "Mobile",
					iban: "IBAN for Donation",
					taxNumber: "Tax Number",
				},
				form: {
					title: "Contact Form",
					concern: "Concern",
					concernPlaceholder: "Your concern",
					message: "Message",
					messagePlaceholder: "Your message",
					submit: "Send message",
				},
			}
		},
		media: {
			pageTitle: "Media",
			categories: {
				books: {
					title: "Books",
				},
				audios: {
					title: "Audios",
					empty: "No audios available.",
				},
				images: {
					title: "Images",
					empty: "No images available.",
				},
				videos: {
					title: "Videos",
					empty: "No videos available.",
				},
				documents: {
					title: "Documents",
					empty: "No documents available.",
				},
				information: {
					title: "Information",
					empty: "No information available.",
				},
			},
			actions: {
				download: "Download",
				openInNewTab: "Open in new tab",
				close: "Close",
				noContent: "No media content is currently available.",
				noPreview: "Preview not available.",
				openFile: "Open file",
			},
		},
		links: {
			title: "Useful links for those affected, family members, and interested individuals",
			description1: "This website offers comprehensive information about ALS, its symptoms, and treatment options.",
			description2: "Support networks and counseling services for those affected and their loved ones."
		}
	},
	cookieBanner: {
		message: "This website uses cookies. More info in our ",
		privacyLinkText: "privacy policy",
		dontShowAgain: "Do not show this banner again",
		acceptAll: "Accept all",
		acceptEssential: "Accept essential only",
	},
	footer: {
		legalNotice: "All rights reserved",
		imprint: "Imprint",
		adminPanel: "Admin-Panel",
	}
}
