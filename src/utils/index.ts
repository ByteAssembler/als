export const getTranslation = (rawTranslation: { translations: { language: string; value: string }[] }, language?: string) => {
	if (!language) {
		return rawTranslation.translations[0]?.value || null;
	}

	const translation = rawTranslation.translations.find(t => t.language === language);
	return translation?.value || rawTranslation.translations[0]?.value || null;
};

export function getImageUrlForImageKey(imageKey: string | null | undefined): string | null {
	if (!imageKey || imageKey.length === 0) return null;
	return `${'https://filestorage.mission72aid.com/'}${'als-blobs'}/${encodeURIComponent(imageKey)}`;
}
