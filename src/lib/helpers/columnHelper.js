export class ColumnHelper {
  constructor(languages = []) {
    this.languages = languages;
  }

  /**
   * Create a translated column with fallback and warning support
   */
  createTranslatedColumn(key, header, currentLanguage, options = {}) {
    return {
      key,
      header,
      primary: options.primary || false,
      render: (item) => {
        const translationObj = item[key];
        const translation = this.getTranslation(translationObj, currentLanguage);
        const warning = this.hasTranslation(translationObj, currentLanguage) 
          ? '' 
          : `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Übersetzung fehlt</span>`;
        
        const content = options.truncate 
          ? `<span class="max-w-xs truncate">${translation}</span>`
          : translation;
          
        return `${content}${warning}`;
      }
    };
  }

  /**
   * Create a link column
   */
  createLinkColumn(key, header) {
    return {
      key,
      header,
      render: (item) => `<a href="${item[key]}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 transition-colors underline">${item[key]}</a>`
    };
  }

  /**
   * Create a date column
   */
  createDateColumn(key, header, format = 'de-DE') {
    return {
      key,
      header,
      render: (item) => {
        const date = new Date(item[key]);
        return date.toLocaleDateString(format);
      }
    };
  }

  /**
   * Create a simple text column
   */
  createTextColumn(key, header, options = {}) {
    return {
      key,
      header,
      primary: options.primary || false,
      render: (item) => {
        const value = item[key] || '-';
        return options.truncate ? `<span class="max-w-xs truncate">${value}</span>` : value;
      }
    };
  }

  /**
   * Create a badge/status column
   */
  createBadgeColumn(key, header, badgeMap = {}) {
    return {
      key,
      header,
      render: (item) => {
        const value = item[key];
        const badge = badgeMap[value] || { text: value, class: 'bg-gray-100 text-gray-800' };
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.class}">${badge.text}</span>`;
      }
    };
  }

  // Helper methods
  getTranslation(translationObj, currentLanguage, fallbackLanguage = 'de') {
    if (!translationObj) return '-';
    return translationObj[currentLanguage] || translationObj[fallbackLanguage] || Object.values(translationObj)[0] || '-';
  }

  hasTranslation(translationObj, language) {
    return translationObj && translationObj[language] && translationObj[language].trim() !== '';
  }
}
