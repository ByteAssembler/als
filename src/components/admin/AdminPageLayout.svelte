<script lang="ts">
  import AdminSection from "./AdminSection.svelte";
  import MultiLanguageFormModal from "../ui/MultiLanguageFormModal.svelte";
  import type { Column, DataItem } from "../ui/DataTable.svelte"; // Assuming types can be imported
  import type { FormField as ModalFormField } from "../ui/MultiLanguageFormModal.svelte"; // Assuming types can be imported

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

  type OnLanguageChangeCallback = (langCode: string) => void;
  type CustomOnEditCallback = (item: DataItem) => void;

  interface Props {
    title: string;
    languages: Language[];
    currentLanguage: string;
    onLanguageChange: OnLanguageChangeCallback;
    columns: Column[];
    data: DataItem[];
    crud: CrudFunctions;
    createButtonText?: string;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    formFields?: ModalFormField[];
    deleteConfirmMessage?: string;
    initialFormData?: Record<string, any>;
    onEdit?: CustomOnEditCallback; // Custom edit handler
  }

  let {
    title,
    languages,
    currentLanguage,
    onLanguageChange,
    columns,
    data,
    crud,
    createButtonText,
    emptyStateTitle,
    emptyStateDescription,
    formFields = [],
    deleteConfirmMessage,
    initialFormData = {},
    onEdit, // Custom edit handler
  }: Props = $props();

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
  title={crud.editingItem
    ? `${title.replace("Verwaltung", "")} bearbeiten`
    : `Neuen ${title.replace(" Verwaltung", "")} erstellen`}
  {languages}
  currentLanguage={crud.modalLanguage}
  onLanguageChange={(lang) => (crud.modalLanguage = lang)}
  onClose={crud.closeModal}
  onSubmit={crud.saveItem()}
  submitText={crud.editingItem ? "Aktualisieren" : "Erstellen"}
  {formFields}
  formData={crud.formData}
/>

{#if crud.loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">Speichere...</p>
    </div>
  </div>
{/if}
