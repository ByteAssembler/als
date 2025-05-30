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

export function validateDate(dateString: string): string | null {
	if (!dateString) return null;

	const datePattern = /^\d{4}-\d{2}-\d{2}$/;
	if (!datePattern.test(dateString)) {
		return "Datum muss im Format YYYY-MM-DD sein.";
	}

	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		return "Ungültiges Datum.";
	}

	return null;
}

export function validateYear(year: any): string | null {
	const yearNum = Number(year);
	if (isNaN(yearNum)) {
		return "Jahr muss eine Zahl sein.";
	}

	const currentYear = new Date().getFullYear();
	if (yearNum < 1000 || yearNum > currentYear + 100) {
		return `Jahr muss zwischen 1000 und ${currentYear + 100} liegen.`;
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

export function createCelebrityValidator() {
	return (formData: Record<string, any>): string | null => {
		// Validate name
		const nameError = validateRequired(formData.name, "Name");
		if (nameError) return nameError;

		// Validate bio translations
		const bioError = validateTranslations(formData.bio, "Biografie");
		if (bioError) return bioError;

		// Validate profession translations
		const professionError = validateTranslations(formData.profession, "Beruf");
		if (professionError) return professionError;

		// Validate birth date
		const bornError = validateRequired(formData.born, "Geburtsdatum");
		if (bornError) return bornError;

		const bornDateError = validateDate(formData.born);
		if (bornDateError) return `Geburtsdatum: ${bornDateError}`;

		// Validate death date (optional)
		if (formData.died) {
			const diedDateError = validateDate(formData.died);
			if (diedDateError) return `Sterbedatum: ${diedDateError}`;

			// Check that death date is after birth date
			const bornDate = new Date(formData.born);
			const diedDate = new Date(formData.died);
			if (diedDate <= bornDate) {
				return "Sterbedatum muss nach dem Geburtsdatum liegen.";
			}
		}

		// Validate ALS year
		const alsYearError = validateRequired(formData.alsYear, "ALS Jahr");
		if (alsYearError) return alsYearError;

		const yearError = validateYear(formData.alsYear);
		if (yearError) return `ALS Jahr: ${yearError}`;

		// Debug: Log the imageKey to verify it's being passed
		console.log("Celebrity validation - imageKey:", formData.imageKey);

		return null;
	};
}

export function validateCoordinate(value: any, fieldName: string): string | null {
	const num = Number(value);
	if (isNaN(num)) {
		return `${fieldName} muss eine gültige Zahl sein.`;
	}

	if (fieldName.toLowerCase().includes("breitengrad") || fieldName.toLowerCase().includes("latitude")) {
		if (num < -90 || num > 90) {
			return "Breitengrad muss zwischen -90 und 90 liegen.";
		}
	}

	if (fieldName.toLowerCase().includes("längengrad") || fieldName.toLowerCase().includes("longitude")) {
		if (num < -180 || num > 180) {
			return "Längengrad muss zwischen -180 und 180 liegen.";
		}
	}

	return null;
}

export function createMapPointCategoryValidator() {
	return (formData: Record<string, any>): string | null => {
		// Validate name translations
		const nameError = validateTranslations(formData.name, "Kategorie-Name");
		if (nameError) return nameError;

		return null;
	};
}

export function createMapPointValidator() {
	return (formData: Record<string, any>): string | null => {
		// Validate name translations
		const nameError = validateTranslations(formData.name, "Name");
		if (nameError) return nameError;

		// Validate category ID
		const categoryError = validateRequired(formData.categoryId, "Kategorie");
		if (categoryError) return categoryError;

		const categoryId = Number(formData.categoryId);
		if (isNaN(categoryId) || categoryId <= 0) {
			return "Bitte wählen Sie eine gültige Kategorie aus.";
		}

		// Validate coordinates
		const latError = validateRequired(formData.latitude, "Breitengrad");
		if (latError) return latError;

		const latitude = Number(formData.latitude);
		if (isNaN(latitude)) {
			return "Breitengrad muss eine gültige Zahl sein.";
		}

		const latCoordError = validateCoordinate(latitude, "Breitengrad");
		if (latCoordError) return latCoordError;

		const lngError = validateRequired(formData.longitude, "Längengrad");
		if (lngError) return lngError;

		const longitude = Number(formData.longitude);
		if (isNaN(longitude)) {
			return "Längengrad muss eine gültige Zahl sein.";
		}

		const lngCoordError = validateCoordinate(longitude, "Längengrad");
		if (lngCoordError) return lngCoordError;

		return null;
	};
}

export function createNavbarValidator() {
	return (formData: Record<string, any>): string | null => {
		const textError = validateTranslations(formData.text, "Anzeigetext");
		if (textError) return textError;

		const hrefError = validateRequired(formData.href, "URL (href)");
		if (hrefError) return hrefError;

		// Basic validation for relative paths, can be expanded
		if (!formData.href.startsWith("/")) {
			return "URL (href) muss mit einem '/' beginnen für relative Pfade.";
		}

		if (formData.order !== undefined && formData.order !== null && formData.order !== "") {
			const orderNum = Number(formData.order);
			if (isNaN(orderNum)) {
				return "Reihenfolge muss eine Zahl sein.";
			}
		}

		return null;
	};
}
