import { trpcAuthQuery } from '../../pages/api/trpc/trpc.js';
import { TranslationHelper } from './translationHelper.js';

export class ApiHelper {
  constructor(entityType, authToken, languages = []) {
    this.entityType = entityType;
    this.authToken = authToken;
    this.languages = languages;
    this.translationHelper = new TranslationHelper(authToken, languages);
  }

  /**
   * Load entities with all translations
   */
  async loadEntities(currentLanguage) {
    try {
      const entities = await trpcAuthQuery(
        `${this.entityType}.list_by_language`, 
        this.authToken, 
        currentLanguage
      );

      return await this.translationHelper.loadEntitiesWithTranslations(
        this.entityType, 
        entities
      );
    } catch (error) {
      console.error(`Failed to load ${this.entityType}:`, error);
      throw error;
    }
  }

  /**
   * Create new entity
   */
  async createEntity(formData, translatableFields = ['name', 'description']) {
    try {
      const cleanedData = this.translationHelper.cleanTranslationData(formData, translatableFields);
      
      return await trpcAuthQuery(`${this.entityType}.create`, this.authToken, cleanedData);
    } catch (error) {
      console.error(`Failed to create ${this.entityType}:`, error);
      throw error;
    }
  }

  /**
   * Update existing entity
   */
  async updateEntity(id, formData, translatableFields = ['name', 'description']) {
    try {
      const cleanedData = this.translationHelper.cleanTranslationData(formData, translatableFields);
      
      return await trpcAuthQuery(`${this.entityType}.update`, this.authToken, {
        id,
        ...cleanedData
      });
    } catch (error) {
      console.error(`Failed to update ${this.entityType}:`, error);
      throw error;
    }
  }

  /**
   * Delete entity
   */
  async deleteEntity(id) {
    try {
      return await trpcAuthQuery(`${this.entityType}.delete`, this.authToken, id);
    } catch (error) {
      console.error(`Failed to delete ${this.entityType}:`, error);
      throw error;
    }
  }

  /**
   * Get auth token from storage
   */
  static getAuthToken() {
    if (typeof window === 'undefined') return 'mock-token';
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || 'mock-token';
  }
}
