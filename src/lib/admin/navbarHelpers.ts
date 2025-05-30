import type { FormField } from "@/components/ui/MultiLanguageFormModal.svelte";
import { createAdminEntityHelper, type DataTransformers } from "./createAdminHelper";
import { trpcAuthQuery } from "@/pages/api/trpc/trpc";
import { createInitialFormDataForLanguages } from "./languageConfig";

// Navbar-specific types
interface NavbarApiType {
  id: number;
  href: string;
  withLanguagePrefix: boolean;
  text: { // Corresponds to RawTranslation include
    translations: Array<{ language: string; value: string }>;
  };
  order: number;
}

interface NavbarFormType {
  id?: number;
  text: Record<string, string>;
  href: string;
  withLanguagePrefix: boolean;
  order: number;
}

interface NavbarApiPayload {
  texts: Record<string, string>; // tRPC handler expects 'texts' for multilingual field
  href: string;
  withLanguagePrefix: boolean;
  order?: number;
}

const navbarTransformers: DataTransformers<NavbarApiType, NavbarFormType> = {
  transformApiToForm: (apiData) => {
    const textObj: Record<string, string> = {};

    if (apiData.text && apiData.text.translations && Array.isArray(apiData.text.translations)) {
      apiData.text.translations.forEach((trans) => {
        textObj[trans.language] = trans.value;
      });
    }

    return {
      id: apiData.id,
      text: textObj,
      href: apiData.href,
      withLanguagePrefix: apiData.withLanguagePrefix,
      order: apiData.order || 0,
    };
  },

  transformFormToApi: (formData): NavbarApiPayload => ({
    texts: formData.text, // Map form 'text' to 'texts' for the API
    href: formData.href,
    withLanguagePrefix: formData.withLanguagePrefix,
    order: Number(formData.order) || 0,
  }),
};

function createNavbarFormFields(): FormField[] {
  return [
    {
      id: "text",
      label: "Anzeigetext",
      type: "text",
      required: true,
      multilingual: true,
      placeholder: "z.B. Startseite, Über uns",
    },
    {
      id: "href",
      label: "URL (href)",
      type: "text",
      required: true,
      multilingual: false,
      placeholder: "/home oder /about",
      helpText: "Relativer Pfad für interne Links (z.B. /kontakt).",
    },
    {
      id: "order",
      label: "Reihenfolge",
      type: "text", // Input type should be text for numbers to allow easier input, validation handles type.
      required: false,
      multilingual: false,
      placeholder: "0",
      helpText: "Bestimmt die Sortierposition (kleinere Zahlen zuerst).",
    },
    {
      id: "withLanguagePrefix",
      label: "Mit Sprachpräfix",
      type: "checkbox",
      multilingual: false,
      helpText: "Wenn aktiviert, wird der Link automatisch mit dem aktuellen Sprachkürzel versehen (z.B. /de/home).",
    },
  ];
}

function createNavbarInitialFormData(): NavbarFormType {
  return {
    text: createInitialFormDataForLanguages(),
    href: "",
    withLanguagePrefix: true,
    order: 0,
  };
}

const navbarApiMethods = {
  list: () => trpcAuthQuery("navbar.list") as Promise<NavbarApiType[]>,
  create: (data: NavbarApiPayload) => trpcAuthQuery("navbar.create", data),
  update: (data: NavbarApiPayload & { id: number }) => trpcAuthQuery("navbar.update", data),
  delete: (id: number) => trpcAuthQuery("navbar.delete", id),
};

export function createNavbarHelper() {
  return createAdminEntityHelper<NavbarApiType, NavbarFormType>({
    formFields: createNavbarFormFields(),
    initialFormData: createNavbarInitialFormData(),
    transformers: navbarTransformers,
    apiMethods: navbarApiMethods,
  });
}

export const navbarHelper = createNavbarHelper();
