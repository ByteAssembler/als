import { trpcClient } from '../services/trpcClient.js';

export function useAdminCrud(entityType, initialData = [], defaultLanguage = 'de') {
  let data = $state(initialData);
  let showModal = $state(false);
  let editingItem = $state(null);
  let modalLanguage = $state(defaultLanguage);
  let formData = $state({});
  let loading = $state(false);
  let error = $state(null);

  // Load data from API
  async function loadData(language) {
    try {
      loading = true;
      error = null;

      let apiData;
      if (entityType === 'link') {
        apiData = await trpcClient.getLinks(language);
      } else {
        apiData = await trpcClient.getEntities(entityType, language);
      }

      // Transform API data to match frontend format
      data = apiData.map(transformApiData);
    } catch (err) {
      console.error('Failed to load data:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // Transform API data to frontend format (handle translations)
  function transformApiData(item) {
    // For links, the API returns name and description as strings
    // We need to convert them to the expected multilingual format
    if (entityType === 'link') {
      return {
        id: item.id,
        name: typeof item.name === 'string' ? { [defaultLanguage]: item.name } : item.name,
        description: typeof item.description === 'string' ? { [defaultLanguage]: item.description } : item.description,
        url: item.url
      };
    }
    return item;
  }

  // Transform frontend data to API format
  function transformToApiData(formData) {
    if (entityType === 'link') {
      return {
        nameRawTranslationId: formData.nameRawTranslationId,
        descriptionRawTranslationId: formData.descriptionRawTranslationId,
        url: formData.url
      };
    }
    return formData;
  }

  function openCreateModal(initialFormData = {}) {
    editingItem = null;
    formData = { ...initialFormData };
    modalLanguage = defaultLanguage;
    showModal = true;
  }

  function openEditModal(item, formDataMapper = (item) => ({ ...item })) {
    editingItem = item;
    formData = formDataMapper(item);
    modalLanguage = defaultLanguage;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingItem = null;
    formData = {};
  }

  function saveItem(saveHandler) {
    return async (e) => {
      e.preventDefault();

      try {
        loading = true;
        error = null;

        const apiData = transformToApiData(formData);

        if (editingItem) {
          // Update existing item
          const updatedItem = await trpcClient.updateEntity(entityType, {
            id: editingItem.id,
            ...apiData
          });

          const index = data.findIndex((item) => item.id === editingItem.id);
          data[index] = transformApiData(updatedItem);
        } else {
          // Create new item
          const newItem = await trpcClient.createEntity(entityType, apiData);
          data = [...data, transformApiData(newItem)];
        }

        if (saveHandler) saveHandler(formData, editingItem);
        closeModal();
      } catch (err) {
        console.error('Failed to save item:', err);
        error = err.message;
      } finally {
        loading = false;
      }
    };
  }

  async function deleteItem(id, confirmMessage = "Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?") {
    if (confirm(confirmMessage)) {
      try {
        loading = true;
        error = null;

        await trpcClient.deleteEntity(entityType, id);
        data = data.filter((item) => item.id !== id);
      } catch (err) {
        console.error('Failed to delete item:', err);
        error = err.message;
      } finally {
        loading = false;
      }
    }
  }

  return {
    // State
    get data() { return data; },
    set data(value) { data = value; },
    get showModal() { return showModal; },
    get editingItem() { return editingItem; },
    get modalLanguage() { return modalLanguage; },
    set modalLanguage(value) { modalLanguage = value; },
    get formData() { return formData; },
    set formData(value) { formData = value; },
    get loading() { return loading; },
    get error() { return error; },

    // Actions
    loadData,
    openCreateModal,
    openEditModal,
    closeModal,
    saveItem,
    deleteItem
  };
}
