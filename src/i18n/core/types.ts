export type TranslationValue =
	| string
	| ((...args: any[]) => string)
	| { [key: string]: TranslationValue };

export type TranslationSchema = {
	[key: string]: TranslationValue;
};

export type AllTranslations<
	Langs extends string,
	Schema extends TranslationSchema,
> = Record<
	Langs,
	Schema
>;

// Creates all possible paths as string literals (e.g. "user.name", "greeting")
export type PathInto<T extends TranslationSchema> = {
	[K in keyof T]: K extends string
	? T[K] extends string | ((...args: any[]) => string) // Leaf node or function
	? K
	: T[K] extends TranslationSchema ? `${K}.${PathInto<T[K]>}` | K
	: never
	: never;
}[keyof T];

// Gets the type of a value under a given path
export type PathValue<
	T extends TranslationSchema,
	P extends PathInto<T>,
> = P extends `${infer Key}.${infer Rest}`
	? Key extends keyof T
	? T[Key] extends TranslationSchema
	? Rest extends PathInto<T[Key]> ? PathValue<T[Key], Rest>
	: never
	: never
	: never
	: P extends keyof T ? T[P]
	: never;

// Gets the argument types if the path value is a function
export type ArgsForPath<
	T extends TranslationSchema,
	P extends PathInto<T>,
> // Ensures that the function in PathValue returns string
	= PathValue<T, P> extends (...args: infer Args) => string ? Args : [];

// Gets the return type (always string, as functions should also return strings)
export type ReturnTypeForPath<
	T extends TranslationSchema,
	P extends PathInto<T>,
> = string;

// The public interface of the i18n instance
export interface I18nInstance<
	Langs extends string,
	Schema extends TranslationSchema,
> {
	t: <P extends PathInto<Schema>>(
		key: P,
		...args: ArgsForPath<Schema, P>
	) => ReturnTypeForPath<Schema, P>;
	tLang: <P extends PathInto<Schema>>(
		lang: string | undefined | null,
		key: P, ...args: ArgsForPath<Schema, P>
	) => ReturnTypeForPath<Schema, P>;
	tWithLang: <P extends PathInto<Schema>>(
		lang: Langs,
		key: P, ...args: ArgsForPath<Schema, P>
	) => ReturnTypeForPath<Schema, P>;
	setLanguage: (lang: Langs) => void;
	getCurrentLanguage: () => Langs;
	getAvailableLanguages: () => Langs[];
	translations: AllTranslations<Langs, Schema>;
}
