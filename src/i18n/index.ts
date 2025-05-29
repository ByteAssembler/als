import { defineI18n } from "./core";
import {
	allTranslations,
	type AppTranslationSchema,
	type AvailableLanguage,
} from "./translations";

const DEFAULT_LANGUAGE: "en" = "en";

export const i18n = defineI18n<
	AvailableLanguage,
	typeof DEFAULT_LANGUAGE,
	AppTranslationSchema
>({
	defaultLanguage: DEFAULT_LANGUAGE,
	translations: allTranslations,
});

export type { PathInto } from "./core";
export type { AppTranslationSchema, AvailableLanguage };
