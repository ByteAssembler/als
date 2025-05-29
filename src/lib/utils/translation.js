export function getTranslation(translationObj, currentLanguage, fallbackLang = 'en') {
	return translationObj?.[currentLanguage] || translationObj?.[fallbackLang] || '-';
}

export function hasTranslation(translationObj, language) {
	return translationObj && translationObj[language];
}

export function createTranslationWarning(translationObj, currentLanguage, languages) {
	if (!translationObj || hasTranslation(translationObj, currentLanguage)) {
		return null;
	}

	const languageName = languages.find(l => l.code === currentLanguage)?.name;
	return `Warnung: Übersetzung für ${languageName} fehlt`;
}
