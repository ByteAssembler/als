<script lang="ts">
  import AdminSection from "./AdminSection.svelte";
  import MultiLanguageFormModal from "../ui/MultiLanguageFormModal.svelte";
  import type { Column, DataItem } from "../ui/DataTable.svelte";
  import type { FormField as ModalFormField } from "../ui/MultiLanguageFormModal.svelte";

  interface Language {
    code: string;
    name: string;
  }

  interface CrudFunctions {
    showModal: boolean;
    editingItem: DataItem | null;
    modalLanguage: string;
    formData: Record<string, any>;
    loading: boolean;
    openCreateModal: (initialData?: Record<string, any>) => void;
    openEditModal: (item: DataItem) => void;
    deleteItem: (id: string | number, confirmMessage?: string) => void;
    closeModal: () => void;
    saveItem: () => (event: SubmitEvent) => void;
  }

  interface Props {
    title: string;
    languages: Language[];
    currentLanguage: string;
    onLanguageChange: (langCode: string) => void;
    columns: Column[];
    data: DataItem[];
    crud: CrudFunctions;
    createButtonText?: string;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    formFields?: ModalFormField[];
    deleteConfirmMessage?: string;
    initialFormData?: Record<string, any>;
    onEdit?: (item: DataItem) => void;
    validateForm?: (formData: Record<string, any>) => string | null;
  }

  let {
    title,
    languages,
    currentLanguage,
    onLanguageChange,
    columns,
    data,
    crud,
    createButtonText = "Neuen Eintrag erstellen",
    emptyStateTitle = "Keine Einträge vorhanden",
    emptyStateDescription = "Erstellen Sie Ihren ersten Eintrag.",
    formFields = [],
    deleteConfirmMessage,
    initialFormData = {},
    onEdit,
    validateForm,
  }: Props = $props();

  // Extract entity name from title for dynamic modal titles
  const entityName = $derived(title.replace(/\s*Verwaltung\s*$/i, "").trim());

  function handleCreate() {
    crud.openCreateModal(initialFormData);
  }

  function handleEdit(item: DataItem) {
    if (onEdit) {
      onEdit(item);
    } else {
      crud.openEditModal(item);
    }
  }

  function handleDelete(id: string | number) {
    crud.deleteItem(id, deleteConfirmMessage);
  }

  function handleSubmit(event: SubmitEvent) {
    if (validateForm) {
      const error = validateForm(crud.formData);
      if (error) {
        alert(error);
        event.preventDefault();
        return;
      }
    }
    crud.saveItem()(event);
  }

  // Dynamic modal title
  const modalTitle = $derived(crud.editingItem ? `${entityName} bearbeiten` : `${entityName} erstellen`);
</script>

<AdminSection
  {title}
  {languages}
  {currentLanguage}
  {onLanguageChange}
  {columns}
  {data}
  onCreate={handleCreate}
  onEdit={handleEdit}
  onDelete={handleDelete}
  {createButtonText}
  {emptyStateTitle}
  {emptyStateDescription}
/>

<MultiLanguageFormModal
  show={crud.showModal}
  title={modalTitle}
  {languages}
  currentLanguage={crud.modalLanguage}
  onLanguageChange={(lang) => (crud.modalLanguage = lang)}
  onClose={crud.closeModal}
  onSubmit={handleSubmit}
  submitText={crud.editingItem ? "Aktualisieren" : "Erstellen"}
  {formFields}
  formData={crud.formData}
/>

{#if crud.loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">
        {crud.editingItem ? "Aktualisiere..." : "Speichere..."}
      </p>
    </div>
  </div>
{/if}
