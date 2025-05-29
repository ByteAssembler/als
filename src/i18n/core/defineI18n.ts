import type {
	ArgsForPath,
	I18nInstance,
	PathInto,
	ReturnTypeForPath,
	TranslationSchema,
	TranslationValue,
} from "./types";

function resolvePath<
	Schema extends TranslationSchema,
	P extends PathInto<Schema>,
>(
	obj: Schema,
	path: P,
	args: ArgsForPath<Schema, P>,
	originalKey: P,
	langForDebug: string,
): ReturnTypeForPath<Schema, P> {
	const keys = (path as string).split(".");
	let current: TranslationValue = obj;

	for (const k of keys) {
		if (typeof current === "object" && current !== null && k in current) {
			const nextValue = (current as TranslationSchema)[k];
			current = nextValue as TranslationValue;
		} else {
			console.warn(
				`Translation key "${originalKey}" (segment "${k}") not found in language "${langForDebug}". Returning key.`,
			);
			return originalKey as string;
		}
	}

	if (typeof current === "function") {
		try {
			const result = current(...(args as any[]));
			if (typeof result === "string") {
				return result;
			} else {
				console.error(
					`Translation function for key "${originalKey}" in language "${langForDebug}" did not return a string (returned: ${typeof result}). Returning key.`,
				);
				return originalKey as string;
			}
		} catch (e) {
			console.error(
				`Error executing translation function for key "${originalKey}" in language "${langForDebug}":`,
				e,
			);
			return originalKey as string;
		}
	}
	if (typeof current === "string") {
		if (args.length > 0) {
			console.warn(
				`Translation key "${originalKey}" in language "${langForDebug}" is a string but received arguments. Args ignored.`,
			);
		}
		return current;
	}

	console.warn(
		`Translation key "${originalKey}" in language "${langForDebug}" resolved to an object, not a string or function. Returning key.`,
	);
	return originalKey as string;
}

export function defineI18n<
	Langs extends string,
	DefaultLang extends Langs,
	Schema extends TranslationSchema,
>(config: {
	defaultLanguage: DefaultLang;
	translations: Record<Langs, Schema> & { [L in DefaultLang]: Schema };
}): I18nInstance<Langs, Schema> {
	let currentLanguage: Langs = config.defaultLanguage;
	const availableLanguages = Object.keys(config.translations) as Langs[];
	const translations = config.translations;

	function setLanguage(lang: Langs): void {
		if (availableLanguages.includes(lang)) {
			currentLanguage = lang;
		} else {
			console.warn(
				`Language "${lang}" is not available. Falling back to "${config.defaultLanguage}".`,
			);
		}
	}

	function getCurrentLanguage(): Langs {
		return currentLanguage;
	}

	function getAvailableLanguages(): Langs[] {
		return [...availableLanguages];
	}

	function tWithLang<P extends PathInto<Schema>>(
		lang: Langs,
		key: P,
		...args: ArgsForPath<Schema, P>
	): ReturnTypeForPath<Schema, P> {
		const langTranslations = translations[lang];

		if (!langTranslations) {
			console.warn(
				`Translations for language "${lang}" not found. Falling back to default language "${config.defaultLanguage}".`,
			);
			const defaultLangTranslations = translations[config.defaultLanguage];
			return resolvePath(
				defaultLangTranslations,
				key,
				args,
				key,
				config.defaultLanguage,
			);
		}
		return resolvePath(langTranslations, key, args, key, lang);
	}

	function t<P extends PathInto<Schema>>(
		key: P,
		...args: ArgsForPath<Schema, P>
	): ReturnTypeForPath<Schema, P> {
		return tWithLang(currentLanguage, key, ...args);
	}

	function tLang<P extends PathInto<Schema>>(
		lang: string | undefined | null,
		key: P,
		...args: ArgsForPath<Schema, P>
	): ReturnTypeForPath<Schema, P> {
		// Check if lang is provided and is a valid language
		if (lang && availableLanguages.includes(lang as Langs)) {
			return tWithLang(lang as Langs, key, ...args);
		}

		// If no valid lang is provided, use the current language
		if (lang) {
			console.warn(
				`Language "${lang}" is not available. Falling back to current language "${currentLanguage}".`,
			);
		}

		return tWithLang(currentLanguage, key, ...args);
	}

	return {
		t,
		tLang,
		tWithLang,
		setLanguage,
		getCurrentLanguage,
		getAvailableLanguages,
		translations: config.translations,
	};
}
