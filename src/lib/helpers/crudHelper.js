import { ApiHelper } from './apiHelper.js';

export class CrudHelper {
  constructor(entityType, languages = [], options = {}) {
    this.entityType = entityType;
    this.languages = languages;
    this.options = {
      translatableFields: ['name', 'description'],
      defaultLanguage: 'de',
      ...options
    };
    
    this.data = $state([]);
    this.showModal = $state(false);
    this.editingItem = $state(null);
    this.modalLanguage = $state(this.options.defaultLanguage);
    this.loading = $state(false);
    this.error = $state(null);
    this.formData = $state({});

    // Initialize API helper
    this.apiHelper = new ApiHelper(
      entityType, 
      ApiHelper.getAuthToken(), 
      languages
    );
  }

  /**
   * Load all entities with translations
   */
  async loadData(currentLanguage) {
    try {
      this.loading = true;
      this.error = null;
      
      this.data = await this.apiHelper.loadEntities(currentLanguage);
    } catch (err) {
      this.error = err.message;
      // Fallback to empty array
      this.data = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Open create modal
   */
  openCreateModal(initialFormData = {}) {
    this.editingItem = null;
    this.formData = this.createEmptyFormData(initialFormData);
    this.modalLanguage = this.options.defaultLanguage;
    this.showModal = true;
  }

  /**
   * Open edit modal
   */
  openEditModal(item, customMapper = null) {
    this.editingItem = item;
    this.formData = customMapper ? customMapper(item) : this.mapItemToFormData(item);
    this.modalLanguage = this.options.defaultLanguage;
    this.showModal = true;
  }

  /**
   * Close modal
   */
  closeModal() {
    this.showModal = false;
    this.editingItem = null;
    this.formData = {};
  }

  /**
   * Save entity (create or update)
   */
  async saveEntity(currentLanguage) {
    try {
      this.loading = true;
      this.error = null;

      if (this.editingItem) {
        await this.apiHelper.updateEntity(
          this.editingItem.id, 
          this.formData, 
          this.options.translatableFields
        );
      } else {
        await this.apiHelper.createEntity(
          this.formData, 
          this.options.translatableFields
        );
      }

      await this.loadData(currentLanguage);
      this.closeModal();
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Delete entity
   */
  async deleteEntity(id, currentLanguage, confirmMessage) {
    if (confirm(confirmMessage)) {
      try {
        this.loading = true;
        this.error = null;

        await this.apiHelper.deleteEntity(id);
        await this.loadData(currentLanguage);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }

  /**
   * Create empty form data structure
   */
  createEmptyFormData(initialData = {}) {
    const formData = { ...initialData };
    
    // Initialize translatable fields as empty objects
    this.options.translatableFields.forEach(field => {
      if (!formData[field]) {
        formData[field] = {};
      }
    });

    return formData;
  }

  /**
   * Map item data to form data structure
   */
  mapItemToFormData(item) {
    const formData = { ...item };
    
    // Ensure translatable fields are objects
    this.options.translatableFields.forEach(field => {
      if (item[field] && typeof item[field] === 'object') {
        formData[field] = { ...item[field] };
      } else {
        formData[field] = {};
      }
    });

    return formData;
  }

  /**
   * Clear error state
   */
  clearError() {
    this.error = null;
  }

  // Getters for reactive state
  get isLoading() { return this.loading; }
  get hasError() { return this.error !== null; }
  get isEditing() { return this.editingItem !== null; }
}
