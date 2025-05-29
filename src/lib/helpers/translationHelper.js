import { trpcAuthQuery } from '../../pages/api/trpc/trpc.js';

export class TranslationHelper {
  constructor(authToken, languages = []) {
    this.authToken = authToken;
    this.languages = languages;
  }

  /**
   * Load all language versions for a single entity
   */
  async loadEntityTranslations(entityType, entityId, baseEntity) {
    const entityData = {
      ...baseEntity,
      name: {},
      description: {},
      title: {},
      content: {},
      bio: {},
      profession: {}
    };

    const loadPromises = this.languages.map(async (lang) => {
      try {
        const entityInLang = await trpcAuthQuery(
          `${entityType}.read_by_language`, 
          this.authToken, 
          entityId, 
          lang.code
        );
        
        if (entityInLang) {
          // Map common translation fields
          if (entityInLang.name) entityData.name[lang.code] = entityInLang.name;
          if (entityInLang.description) entityData.description[lang.code] = entityInLang.description;
          if (entityInLang.title) entityData.title[lang.code] = entityInLang.title;
          if (entityInLang.content) entityData.content[lang.code] = entityInLang.content;
          if (entityInLang.bio) entityData.bio[lang.code] = entityInLang.bio;
          if (entityInLang.profession) entityData.profession[lang.code] = entityInLang.profession;
        }
      } catch (err) {
        console.warn(`Failed to load ${lang.code} version of ${entityType} ${entityId}:`, err);
      }
    });

    await Promise.all(loadPromises);
    return entityData;
  }

  /**
   * Load all language versions for multiple entities
   */
  async loadEntitiesWithTranslations(entityType, entities) {
    const entityPromises = entities.map(entity => 
      this.loadEntityTranslations(entityType, entity.id, entity)
    );
    
    return await Promise.all(entityPromises);
  }

  /**
   * Clean form data by removing empty strings and organizing translations
   */
  cleanTranslationData(formData, translatableFields = ['name', 'description']) {
    const cleanedData = { ...formData };

    translatableFields.forEach(field => {
      if (formData[field] && typeof formData[field] === 'object') {
        const cleaned = {};
        for (const [lang, value] of Object.entries(formData[field])) {
          if (value && value.trim()) {
            cleaned[lang] = value.trim();
          }
        }
        cleanedData[field] = Object.keys(cleaned).length > 0 ? cleaned : undefined;
      }
    });

    return cleanedData;
  }

  /**
   * Get fallback translation when current language is not available
   */
  getTranslationWithFallback(translationObj, currentLanguage, fallbackLanguage = 'de') {
    if (!translationObj) return '-';
    return translationObj[currentLanguage] || translationObj[fallbackLanguage] || Object.values(translationObj)[0] || '-';
  }

  /**
   * Check if translation exists for a specific language
   */
  hasTranslation(translationObj, language) {
    return translationObj && translationObj[language] && translationObj[language].trim() !== '';
  }

  /**
   * Create translation warning message
   */
  createTranslationWarning(translationObj, currentLanguage) {
    if (this.hasTranslation(translationObj, currentLanguage)) return null;
    
    const languageName = this.languages.find(l => l.code === currentLanguage)?.name;
    return `Warnung: Übersetzung für ${languageName} fehlt`;
  }
}
