<script lang="ts">
  import { onMount } from "svelte";
  import AdminPageLayout from "@/components/admin/AdminPageLayout.svelte";
  import type { Column } from "@/components/ui/DataTable.svelte";
  import { getTranslation, hasTranslation, createTranslationWarning } from "@/lib/utils/translation";
  import { createNavbarValidator } from "@/lib/utils/validation";
  import { navbarHelper } from "@/lib/admin/navbarHelpers";
  import { createStandardLanguages } from "@/lib/admin/commonConfig";
  // Import TranslationBadge if you intend to use it directly in the template later
  // import TranslationBadge from "@/components/ui/TranslationBadge.svelte";

  const languages = createStandardLanguages();
  let currentLanguage = $state("de");
  let navItems = $state<any[]>([]);
  let loading = $state(false);

  let crudState = $state({
    showModal: false,
    editingItem: null as any,
    modalLanguage: "de",
    formData: {} as Record<string, any>,
    loading: false,
  });

  async function loadNavItems() {
    try {
      loading = true;
      navItems = await navbarHelper.loadData();
    } catch (error) {
      console.error("Fehler beim Laden der Navigationselemente:", error);
      alert("Fehler beim Laden der Navigationselemente. Bitte laden Sie die Seite neu.");
    } finally {
      loading = false;
    }
  }

  const crudFunctions = navbarHelper.createCrud(loadNavItems);
  const crud = {
    get showModal() {
      return crudState.showModal;
    },
    get editingItem() {
      return crudState.editingItem;
    },
    get modalLanguage() {
      return crudState.modalLanguage;
    },
    set modalLanguage(value: string) {
      crudState.modalLanguage = value;
    },
    get formData() {
      return crudState.formData;
    },
    get loading() {
      return crudState.loading;
    },
    openCreateModal: (initialData = {}) => crudFunctions.openCreateModal(crudState, initialData),
    openEditModal: (item: any) => crudFunctions.openEditModal(crudState, item),
    deleteItem: async (id: string | number, confirmMessage?: string) =>
      await crudFunctions.deleteItem(crudState, id, confirmMessage),
    closeModal: () => crudFunctions.closeModal(crudState),
    saveItem: () => crudFunctions.saveItem(crudState),
  };

  const { formFields, initialFormData } = navbarHelper.formConfig;

  const columns = $derived<Column[]>([
    {
      header: "Reihenfolge",
      key: "order",
      render: (item) => item.order?.toString() || "0",
    },
    {
      header: "Anzeigetext",
      key: "text",
      primary: true,
      render: (item) => {
        const translatedText = getTranslation(item.text, currentLanguage);
        let badgeHtml = "";
        if (item.text && Object.keys(item.text).length > 0 && !hasTranslation(item.text, currentLanguage)) {
          const warningText = createTranslationWarning(item.text, currentLanguage, languages);
          if (warningText) {
            badgeHtml = `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" aria-label="${warningText}">Übersetzung fehlt</span>`;
          }
        }
        return `<div class="flex items-center"><span>${translatedText || "Kein Text"}</span>${badgeHtml}</div>`;
      },
    },
    {
      header: "URL (href)",
      key: "href",
      render: (item) => `<span class="font-mono text-xs">${item.href}</span>`,
    },
    {
      header: "Mit Sprachpräfix",
      key: "withLanguagePrefix",
      render: (item) => (item.withLanguagePrefix ? "Ja" : "Nein"),
    },
  ]);

  onMount(() => {
    loadNavItems();
  });

  const tableData = $derived(
    navItems
      .map((item) => ({
        id: item.id,
        text: item.text, // This is Record<string, string>
        href: item.href,
        withLanguagePrefix: item.withLanguagePrefix,
        order: item.order,
      }))
      .sort((a, b) => {
        // Primary sort by order
        if (a.order < b.order) return -1;
        if (a.order > b.order) return 1;

        // Secondary sort by text if order is the same
        const textA = getTranslation(a.text, currentLanguage, "de").toLowerCase();
        const textB = getTranslation(b.text, currentLanguage, "de").toLowerCase();
        if (textA < textB) return -1;
        if (textA > textB) return 1;
        return 0;
      })
  );
</script>

<AdminPageLayout
  title="Navigationselemente Verwalten"
  {languages}
  {currentLanguage}
  onLanguageChange={(lang) => (currentLanguage = lang)}
  {columns}
  data={tableData}
  {crud}
  createButtonText="Neues Navigationselement hinzufügen"
  emptyStateTitle="Keine Navigationselemente vorhanden"
  emptyStateDescription="Erstellen Sie Ihr erstes Element für die Navigation."
  {formFields}
  deleteConfirmMessage="Sind Sie sicher, dass Sie dieses Navigationselement löschen möchten?"
  {initialFormData}
  validateForm={createNavbarValidator()}
/>

{#if loading || crud.loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">
        {#if loading}
          Lade Navigationselemente...
        {:else if crud.loading}
          Speichere Navigationselement...
        {/if}
      </p>
    </div>
  </div>
{/if}
