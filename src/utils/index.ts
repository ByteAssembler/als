export const getTranslation = (rawTranslation: { translations: { language: string; value: string }[] }, language?: string) => {
	if (!language) {
		return rawTranslation.translations[0]?.value || null;
	}

	const translation = rawTranslation.translations.find(t => t.language === language);
	return translation?.value || rawTranslation.translations[0]?.value || null;
};
