import {
	type AppTranslationSchema as DefaultAppTranslationSchema,
	enTranslations,
} from "./en";
import { deTranslations } from "./de";

export const allTranslations = {
	en: enTranslations,
	de: deTranslations,
	// ...
};

export type AppTranslationSchema = DefaultAppTranslationSchema;

export type AvailableLanguage = keyof typeof allTranslations;

