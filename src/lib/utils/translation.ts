export function getTranslation(
	translationObj: { [key: string]: string } | undefined,
	currentLanguage: string,
	fallbackLang: string = 'en'
): string {
	return translationObj?.[currentLanguage] || translationObj?.[fallbackLang] || '-';
}

export function hasTranslation(translationObj: { [key: string]: string } | undefined, language: string): boolean {
	return !!translationObj && !!translationObj[language];
}

export function createTranslationWarning(
	translationObj: { [key: string]: string } | undefined,
	currentLanguage: string,
	languages: { code: string; name: string }[]
): string | null {
	if (!translationObj || hasTranslation(translationObj, currentLanguage)) {
		return null;
	}

	const languageName = languages.find(l => l.code === currentLanguage)?.name;
	return `Warnung: Übersetzung für ${languageName} fehlt`;
}
