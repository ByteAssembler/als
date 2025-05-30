export function validateRequired(value: any, fieldName: string): string | null {
	if (!value || (typeof value === 'string' && value.trim() === '')) {
		return `${fieldName} ist erforderlich.`;
	}
	return null;
}

export function validateUrl(url: string): string | null {
	if (!url) return null;

	// Allow relative URLs (starting with /) or full URLs
	const relativeUrlPattern = /^\/[^\s]*$/;
	const fullUrlPattern = /^https?:\/\/[^\s]+$/;

	if (!relativeUrlPattern.test(url) && !fullUrlPattern.test(url)) {
		return "URL muss entweder eine relative URL (beginnend mit /) oder eine vollständige URL (beginnend mit http:// oder https://) sein.";
	}

	return null;
}

export function validateTranslations(
	translations: Record<string, string>,
	fieldName: string,
	requiredLanguages: string[] = ['de']
): string | null {
	for (const lang of requiredLanguages) {
		if (!translations[lang] || translations[lang].trim() === '') {
			return `${fieldName} ist für ${lang.toUpperCase()} erforderlich.`;
		}
	}
	return null;
}

export function createLinkValidator() {
	return (formData: Record<string, any>): string | null => {
		// Validate title translations
		const titleError = validateTranslations(formData.title, "Titel");
		if (titleError) return titleError;

		// Validate URL
		const urlError = validateRequired(formData.url, "URL");
		if (urlError) return urlError;

		const urlFormatError = validateUrl(formData.url);
		if (urlFormatError) return urlFormatError;

		return null;
	};
}
