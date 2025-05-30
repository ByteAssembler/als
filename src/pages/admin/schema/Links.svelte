<script lang="ts">
  import { onMount } from "svelte";
  import AdminPageLayout from "../../../components/admin/AdminPageLayout.svelte";
  import TranslationBadge from "../../../components/ui/TranslationBadge.svelte";
  import type { Column } from "../../../components/ui/DataTable.svelte";
  import { getTranslation } from "../../../lib/utils/translation.js";
  import { createLinkValidator } from "../../../lib/utils/validation.js";
  import { linkHelper } from "../../../lib/admin/linkHelpers.js";
  import { createStandardLanguages } from "../../../lib/admin/commonConfig.js";

  // Configuration
  const languages = createStandardLanguages();
  let currentLanguage = $state("de");
  let links = $state<any[]>([]);
  let loading = $state(false);

  // CRUD state
  let crudState = $state({
    showModal: false,
    editingItem: null as any,
    modalLanguage: "de",
    formData: {} as Record<string, any>,
    loading: false,
  });

  // Load data
  async function loadLinks() {
    try {
      loading = true;
      links = await linkHelper.loadData();
    } catch (error) {
      console.error("Fehler beim Laden der Links:", error);
      alert("Fehler beim Laden der Links. Bitte laden Sie die Seite neu.");
    } finally {
      loading = false;
    }
  }

  // Setup CRUD
  const crudFunctions = linkHelper.createCrud(loadLinks);
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

  // Configuration from helper
  const { formFields, initialFormData } = linkHelper.formConfig;

  // Create columns as a derived value to capture currentLanguage reactively
  const columns = $derived<Column[]>([
    {
      header: "Titel",
      key: "title",
      primary: true,
      render: (item) => {
        const title = getTranslation(item.title, currentLanguage);
        return `<div class="flex items-center"><span>${title}</span></div>`;
      },
    },
    {
      header: "URL",
      key: "url",
      render: (item) => {
        const isExternal = item.url?.startsWith("http");
        const icon = isExternal
          ? '<svg class="inline w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>'
          : "";
        return `<span class="font-mono text-xs">${item.url}${icon}</span>`;
      },
    },
    {
      header: "Beschreibung",
      key: "description",
      render: (item) => {
        const description = getTranslation(item.description, currentLanguage);
        return description ? `<span class="text-xs text-muted-foreground">${description}</span>` : "-";
      },
    },
  ]);

  onMount(() => {
    loadLinks();
  });

  const tableData = $derived(
    links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      order: link.order,
      isActive: link.isActive,
    }))
  );
</script>

<AdminPageLayout
  title="Links Verwaltung"
  {languages}
  {currentLanguage}
  onLanguageChange={(lang) => (currentLanguage = lang)}
  {columns}
  data={tableData}
  {crud}
  createButtonText="Neuen Link hinzufügen"
  emptyStateTitle="Keine Links vorhanden"
  emptyStateDescription="Erstellen Sie Ihren ersten Link für die Navigation."
  {formFields}
  deleteConfirmMessage="Sind Sie sicher, dass Sie diesen Link löschen möchten?"
  {initialFormData}
  validateForm={createLinkValidator()}
/>

{#if loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">Lade Links...</p>
    </div>
  </div>
{/if}
