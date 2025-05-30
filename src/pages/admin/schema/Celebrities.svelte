<script lang="ts">
  import { onMount } from "svelte";
  import AdminPageLayout from "../../../components/admin/AdminPageLayout.svelte";
  import type { Column } from "../../../components/ui/DataTable.svelte";
  import { getTranslation } from "../../../lib/utils/translation.js";
  import { createCelebrityValidator } from "../../../lib/utils/validation.js";
  import { celebrityHelper } from "../../../lib/admin/celebrityHelpers.js";
  import { createStandardLanguages, createCelebrityColumns } from "../../../lib/admin/commonConfig.js";

  // Configuration
  const languages = createStandardLanguages();
  let currentLanguage = $state("de");
  let celebrities = $state<any[]>([]);
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
  async function loadCelebrities() {
    try {
      loading = true;
      celebrities = await celebrityHelper.loadData();
    } catch (error) {
      console.error("Fehler beim Laden der Persönlichkeiten:", error);
      alert("Fehler beim Laden der Persönlichkeiten. Bitte laden Sie die Seite neu.");
    } finally {
      loading = false;
    }
  }

  // Setup CRUD
  const crudFunctions = celebrityHelper.createCrud(loadCelebrities);
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
  const { formFields, initialFormData } = celebrityHelper.formConfig;

  // Create columns as a derived value to capture currentLanguage reactively
  const columns = $derived(createCelebrityColumns(currentLanguage));

  onMount(() => {
    loadCelebrities();
  });

  const tableData = $derived(
    celebrities.map((celebrity) => ({
      id: celebrity.id,
      name: celebrity.name,
      bio: celebrity.bio,
      profession: celebrity.profession,
      imageKey: celebrity.imageKey,
      born: celebrity.born,
      died: celebrity.died,
      alsYear: celebrity.alsYear,
    }))
  );
</script>

<AdminPageLayout
  title="Persönlichkeiten Verwaltung"
  {languages}
  {currentLanguage}
  onLanguageChange={(lang) => (currentLanguage = lang)}
  {columns}
  data={tableData}
  {crud}
  createButtonText="Neue Persönlichkeit hinzufügen"
  emptyStateTitle="Keine Persönlichkeiten vorhanden"
  emptyStateDescription="Erstellen Sie Ihren ersten Eintrag für eine ALS-relevante Persönlichkeit."
  {formFields}
  deleteConfirmMessage="Sind Sie sicher, dass Sie diese Persönlichkeit löschen möchten?"
  {initialFormData}
  validateForm={createCelebrityValidator()}
/>

{#if loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">Lade Persönlichkeiten...</p>
    </div>
  </div>
{/if}
