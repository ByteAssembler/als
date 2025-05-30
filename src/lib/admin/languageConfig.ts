export interface Language {
	code: string; // max 5 characters
	name: string;
}

// Default languages - can be overridden
export const DEFAULT_LANGUAGES: Language[] = [
	{ code: "de", name: "Deutsch" },
	{ code: "en", name: "English" },
	{ code: "it", name: "Italiano" },
];

// Global language configuration
let globalLanguages: Language[] = [...DEFAULT_LANGUAGES];

export function setGlobalLanguages(languages: Language[]): void {
	// Validate language codes (max 5 characters)
	for (const lang of languages) {
		if (lang.code.length > 5) {
			throw new Error(`Language code "${lang.code}" exceeds 5 characters limit`);
		}
		if (!lang.code.trim() || !lang.name.trim()) {
			throw new Error("Language code and name cannot be empty");
		}
	}

	globalLanguages = [...languages];
}

export function getGlobalLanguages(): Language[] {
	return [...globalLanguages];
}

export function addLanguage(language: Language): void {
	if (language.code.length > 5) {
		throw new Error(`Language code "${language.code}" exceeds 5 characters limit`);
	}

	const exists = globalLanguages.some(lang => lang.code === language.code);
	if (exists) {
		throw new Error(`Language with code "${language.code}" already exists`);
	}

	globalLanguages.push(language);
}

export function removeLanguage(code: string): void {
	const index = globalLanguages.findIndex(lang => lang.code === code);
	if (index === -1) {
		throw new Error(`Language with code "${code}" not found`);
	}

	globalLanguages.splice(index, 1);
}

export function updateLanguage(code: string, updatedLanguage: Language): void {
	if (updatedLanguage.code.length > 5) {
		throw new Error(`Language code "${updatedLanguage.code}" exceeds 5 characters limit`);
	}

	const index = globalLanguages.findIndex(lang => lang.code === code);
	if (index === -1) {
		throw new Error(`Language with code "${code}" not found`);
	}

	globalLanguages[index] = updatedLanguage;
}

// Language configuration for forms
export function createInitialFormDataForLanguages(languages: Language[] = globalLanguages): Record<string, string> {
	const result: Record<string, string> = {};
	languages.forEach(lang => {
		result[lang.code] = "";
	});
	return result;
}

export function validateLanguageCode(code: string): boolean {
	return code.length > 0 && code.length <= 5 && /^[a-zA-Z-]+$/.test(code);
}
