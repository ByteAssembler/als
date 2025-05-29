export const linksConfig = {
  title: "Links Verwaltung",
  createButtonText: "Neuen Link hinzufügen",
  emptyStateTitle: "Keine Links vorhanden",
  emptyStateDescription: "Erstellen Sie Ihren ersten Link, um zu beginnen.",
  deleteConfirmMessage: "Sind Sie sicher, dass Sie diesen Link löschen möchten?",
  initialFormData: {
    name: {},
    description: {},
    url: "",
    nameRawTranslationId: null,
    descriptionRawTranslationId: null
  },
  formFields: [
    {
      id: "name",
      label: "Name",
      required: true,
      placeholder: "Link Name",
      multilingual: true,
      getHelpText: (currentLanguage) =>
        currentLanguage !== "de" ? "Optional - falls leer, wird die deutsche Version verwendet" : ""
    },
    {
      id: "description",
      label: "Beschreibung",
      type: "textarea",
      placeholder: "Optionale Beschreibung des Links",
      multilingual: true
    },
    {
      id: "url",
      label: "URL",
      type: "url",
      required: true,
      placeholder: "https://example.com",
      multilingual: false,
      helpText: "Vollständige URL inklusive https://"
    }
  ]
};

export const navbarConfig = {
  title: "Navigation Verwaltung",
  createButtonText: "Neuen Navigationseintrag hinzufügen",
  emptyStateTitle: "Keine Navigationseinträge vorhanden",
  emptyStateDescription: "Erstellen Sie Ihren ersten Navigationseintrag, um zu beginnen.",
  deleteConfirmMessage: "Sind Sie sicher, dass Sie diesen Navigationseintrag löschen möchten?",
  initialFormData: {
    text: {},
    href: "",
    withLanguagePrefix: false
  },
  formFields: [
    {
      id: "text",
      label: "Text",
      required: true,
      placeholder: "Navigationstext",
      multilingual: true,
      getHelpText: (currentLanguage) =>
        currentLanguage !== "de" ? "Optional - falls leer, wird die deutsche Version verwendet" : ""
    },
    {
      id: "href",
      label: "Link (href)",
      required: true,
      placeholder: "/page",
      multilingual: false,
      helpText: "Relativer oder absoluter Link"
    },
    {
      id: "withLanguagePrefix",
      label: "Mit Sprachpräfix",
      type: "checkbox",
      multilingual: false,
      helpText: "Soll der Link automatisch mit dem Sprachpräfix erweitert werden?"
    }
  ]
};
