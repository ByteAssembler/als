<script>
  import AdminSection from "./AdminSection.svelte";
  import MultiLanguageFormModal from "../ui/MultiLanguageFormModal.svelte";

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
  } = $props();

  function handleCreate() {
    crud.openCreateModal(initialFormData);
  }

  function handleEdit(item) {
    if (onEdit) {
      onEdit(item);
    } else {
      crud.openEditModal(item);
    }
  }

  function handleDelete(id) {
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
