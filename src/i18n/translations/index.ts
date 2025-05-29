import {
  type AppTranslationSchema as DefaultAppTranslationSchema,
  enTranslations,
} from "./en";
import { deTranslations } from "./de";
import { itTranslations } from "./it";

export const allTranslations = {
  en: enTranslations,
  de: deTranslations,
  it: itTranslations,
  // ...
};

export type AppTranslationSchema = DefaultAppTranslationSchema;

export type AvailableLanguage = keyof typeof allTranslations;

