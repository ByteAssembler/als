<script lang="ts">
  import { onMount } from "svelte";
  import AdminPageLayout from "../../../components/admin/AdminPageLayout.svelte";
  import type { Column } from "../../../components/ui/DataTable.svelte";
  import { getTranslation, hasTranslation, createTranslationWarning } from "../../../lib/utils/translation";
  import { createBlogValidator } from "../../../lib/utils/validation";
  import { blogHelper } from "../../../lib/admin/blogHelpers";
  import { createStandardLanguages } from "../../../lib/admin/commonConfig";

  const languages = createStandardLanguages();
  let currentLanguage = $state("de");
  let blogPosts = $state<any[]>([]);
  let loading = $state(false);

  let crudState = $state({
    showModal: false,
    editingItem: null as any,
    modalLanguage: "de",
    formData: {} as Record<string, any>,
    loading: false,
  });

  async function loadBlogPosts() {
    try {
      loading = true;
      blogPosts = await blogHelper.loadData();
    } catch (error) {
      console.error("Fehler beim Laden der Blog-Beiträge:", error);
      alert("Fehler beim Laden der Blog-Beiträge. Bitte laden Sie die Seite neu.");
    } finally {
      loading = false;
    }
  }

  const crudFunctions = blogHelper.createCrud(loadBlogPosts);
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

  const { formFields, initialFormData } = blogHelper.formConfig;

  const columns = $derived<Column[]>([
    {
      header: "Titel",
      key: "title",
      primary: true,
      render: (item) => {
        const translatedText = getTranslation(item.title, currentLanguage);
        let badgeHtml = "";
        if (item.title && Object.keys(item.title).length > 0 && !hasTranslation(item.title, currentLanguage)) {
          const warningText = createTranslationWarning(item.title, currentLanguage, languages);
          if (warningText) {
            badgeHtml = `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" aria-label="${warningText}">Übersetzung fehlt</span>`;
          }
        }
        return `<div class="flex items-center"><span>${translatedText || "Kein Titel"}</span>${badgeHtml}</div>`;
      },
    },
    {
      header: "Slug",
      key: "slug",
      render: (item) => `<span class="font-mono text-xs">${item.slug}</span>`,
    },
    {
      header: "Autoren",
      key: "authors",
      render: (item) => (Array.isArray(item.authors) ? item.authors.join(", ") : item.authors || "-"),
    },
    {
      header: "Veröffentlicht",
      key: "publishedAt",
      render: (item) => (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "-"),
    },
    {
      header: "Aktualisiert",
      key: "updatedAt",
      render: (item) => (item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"),
    },
  ]);

  onMount(() => {
    loadBlogPosts();
  });

  const tableData = $derived(
    blogPosts
      .map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        authors: item.authors,
        coverImageKey: item.coverImageKey,
        publishedAt: item.publishedAt,
        updatedAt: item.updatedAt,
        content: item.content, // For editing
      }))
      .sort((a, b) => {
        // Sort by updatedAt descending
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      })
  );
</script>

<AdminPageLayout
  title="Blog-Beiträge Verwalten"
  {languages}
  {currentLanguage}
  onLanguageChange={(lang) => (currentLanguage = lang)}
  {columns}
  data={tableData}
  {crud}
  createButtonText="Neuen Blog-Beitrag erstellen"
  emptyStateTitle="Keine Blog-Beiträge vorhanden"
  emptyStateDescription="Erstellen Sie Ihren ersten Blog-Beitrag."
  {formFields}
  deleteConfirmMessage="Sind Sie sicher, dass Sie diesen Blog-Beitrag löschen möchten?"
  {initialFormData}
  validateForm={createBlogValidator()}
/>

{#if loading || crud.loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">
        {#if loading}
          Lade Blog-Beiträge...
        {:else if crud.loading}
          Speichere Blog-Beitrag...
        {/if}
      </p>
    </div>
  </div>
{/if}
