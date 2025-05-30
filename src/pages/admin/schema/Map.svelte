<script lang="ts">
  import { onMount } from "svelte";
  import AdminSection from "@/components/admin/AdminSection.svelte";
  import MultiLanguageFormModal from "@/components/ui/MultiLanguageFormModal.svelte";
  import { getTranslation } from "@/lib/utils/translation";
  import { createMapPointCategoryValidator, createMapPointValidator } from "@/lib/utils/validation";
  import { mapPointCategoryHelper, mapPointHelper } from "@/lib/admin/mapHelpers";
  import {
    createStandardLanguages,
    createMapPointCategoryColumns,
    createMapPointColumns,
  } from "@/lib/admin/commonConfig";

  // Configuration
  const languages = createStandardLanguages();
  let currentLanguage = $state("de");
  let categories = $state<any[]>([]);
  let mapPoints = $state<any[]>([]);
  let loading = $state(false);
  let activeTab = $state<"categories" | "points">("categories");

  // CRUD state for categories
  let categoryCrudState = $state({
    showModal: false,
    editingItem: null as any,
    modalLanguage: "de",
    formData: {} as Record<string, any>,
    loading: false,
  });

  // CRUD state for map points
  let mapPointCrudState = $state({
    showModal: false,
    editingItem: null as any,
    modalLanguage: "de",
    formData: {} as Record<string, any>,
    loading: false,
  });

  // Load data functions
  async function loadCategories() {
    try {
      loading = true;
      categories = await mapPointCategoryHelper.loadData();
    } catch (error) {
      console.error("Fehler beim Laden der Kategorien:", error);
      alert("Fehler beim Laden der Kategorien. Bitte laden Sie die Seite neu.");
    } finally {
      loading = false;
    }
  }

  async function loadMapPoints() {
    try {
      loading = true;
      mapPoints = await mapPointHelper.loadData();
    } catch (error) {
      console.error("Fehler beim Laden der Kartenpunkte:", error);
      alert("Fehler beim Laden der Kartenpunkte. Bitte laden Sie die Seite neu.");
    } finally {
      loading = false;
    }
  }

  // Setup CRUD for categories
  const categoryCrudFunctions = mapPointCategoryHelper.createCrud(loadCategories);
  const categoryCrud = {
    get showModal() {
      return categoryCrudState.showModal;
    },
    get editingItem() {
      return categoryCrudState.editingItem;
    },
    get modalLanguage() {
      return categoryCrudState.modalLanguage;
    },
    set modalLanguage(value: string) {
      categoryCrudState.modalLanguage = value;
    },
    get formData() {
      return categoryCrudState.formData;
    },
    get loading() {
      return categoryCrudState.loading;
    },
    openCreateModal: (initialData = {}) => categoryCrudFunctions.openCreateModal(categoryCrudState, initialData),
    openEditModal: (item: any) => categoryCrudFunctions.openEditModal(categoryCrudState, item),
    deleteItem: async (id: string | number, confirmMessage?: string) =>
      await categoryCrudFunctions.deleteItem(categoryCrudState, id, confirmMessage),
    closeModal: () => categoryCrudFunctions.closeModal(categoryCrudState),
    saveItem: () => categoryCrudFunctions.saveItem(categoryCrudState),
  };

  // Setup CRUD for map points
  const mapPointCrudFunctions = mapPointHelper.createCrud(async () => {
    await loadMapPoints();
    await loadCategories();
  });
  const mapPointCrud = {
    get showModal() {
      return mapPointCrudState.showModal;
    },
    get editingItem() {
      return mapPointCrudState.editingItem;
    },
    get modalLanguage() {
      return mapPointCrudState.modalLanguage;
    },
    set modalLanguage(value: string) {
      mapPointCrudState.modalLanguage = value;
    },
    get formData() {
      return mapPointCrudState.formData;
    },
    get loading() {
      return mapPointCrudState.loading;
    },
    openCreateModal: (initialData = {}) => mapPointCrudFunctions.openCreateModal(mapPointCrudState, initialData),
    openEditModal: (item: any) => mapPointCrudFunctions.openEditModal(mapPointCrudState, item),
    deleteItem: async (id: string | number, confirmMessage?: string) =>
      await mapPointCrudFunctions.deleteItem(mapPointCrudState, id, confirmMessage),
    closeModal: () => mapPointCrudFunctions.closeModal(mapPointCrudState),
    saveItem: () => mapPointCrudFunctions.saveItem(mapPointCrudState),
  };

  // Configuration from helpers
  const { formFields: categoryFormFields, initialFormData: categoryInitialFormData } =
    mapPointCategoryHelper.formConfig;
  const { formFields: mapPointFormFields, initialFormData: mapPointInitialFormData } = mapPointHelper.formConfig;

  /**
   * IMPORTANT NOTE FOR `mapPointCategoryHelper` (in `@/lib/admin/mapHelpers.ts`):
   * To enable icon selection for map point categories (similar to how image selection works for Celebrities),
   * the `mapPointCategoryHelper.formConfig` object needs to be correctly defined.
   *
   * The `MultiLanguageFormModal` uses the `useFileManager: true` property on a field definition
   * to render the `FileManagerSelect` component, allowing users to pick a file.
   *
   * Ensure your `mapPointCategoryHelper.formConfig` looks similar to this for the `iconKey`:
   *
   * ```typescript
   * // Inside @/lib/admin/mapHelpers.ts (or wherever mapPointCategoryHelper is defined)
   *
   * export const mapPointCategoryHelper = {
   *   // ... other helper parts ...
   *   formConfig: {
   *     formFields: [
   *       {
   *         id: "names", // Example: your existing multilingual name field
   *         label: "Name",
   *         type: "text",
   *         multilingual: true,
   *         required: true,
   *         placeholder: "Kategoriename"
   *       },
   *       // THIS IS THE CRUCIAL PART FOR ICON SELECTION:
   *       {
   *         id: "iconKey",
   *         label: "Icon (Dateiname)",
   *         type: "text", // FileManagerSelect binds to a text input that stores the filename
   *         useFileManager: true, // This tells MultiLanguageFormModal to use FileManagerSelect
   *         multilingual: false,  // iconKey is typically not multilingual
   *         required: false,      // Set to true if an icon is mandatory
   *         placeholder: "z.B. kategorie_icon.png",
   *         helpText: "Wählen Sie eine Datei aus dem File Manager als Icon für diese Kategorie."
   *       }
   *       // ... any other fields ...
   *     ],
   *     initialFormData: {
   *       names: { de: "", en: "" }, // Ensure all languages defined in createStandardLanguages() are present
   *       iconKey: "",               // Initial value for the icon key
   *       // ... other initial form data properties ...
   *     },
   *   },
   *   // Ensure transformApiToForm and transformFormToApi correctly handle 'iconKey':
   *   // transformApiToForm: (item) => ({ ...item, names: parseTranslations(item.names), iconKey: item.iconKey || "" }),
   *   // transformFormToApi: (formData) => ({ ...formData, iconKey: formData.iconKey || null }), // Send null if empty
   *
   *   // The createMapPointCategoryValidator factory function (part of mapPointCategoryHelper)
   *   // should be updated to validate `iconKey` if necessary (e.g., ensure it's a string if provided).
   *   // Example within the validator:
   *   // if (data.iconKey && typeof data.iconKey !== 'string') {
   *   //   return "Icon Key muss ein String sein.";
   *   // }
   * };
   * ```
   *
   * By setting `useFileManager: true` for the `iconKey` field, the modal will automatically
   * render the file selection component for it.
   */

  // Enhanced map point form fields with category selector
  const enhancedMapPointFormFields = $derived(() => {
    return mapPointFormFields.map((field) => {
      if (field.id === "categoryId") {
        return {
          ...field,
          type: "select" as const,
          options: [
            { value: "", label: "Bitte wählen Sie eine Kategorie..." },
            ...categories.map((cat) => ({
              value: cat.id.toString(),
              label: getTranslation(cat.name, currentLanguage),
            })),
          ],
          helpText: `Verfügbare Kategorien: ${categories.length}`,
        };
      }
      return field;
    });
  });

  // Create columns
  // IMPORTANT: The `createMapPointCategoryColumns` function (likely in @/lib/admin/commonConfig.ts)
  // needs to be updated to display the iconKey or a preview of the icon.
  // Example modification for createMapPointCategoryColumns:
  // export function createMapPointCategoryColumns(currentLanguage: string, /* other params */): ColumnDef[] {
  //   return [
  //     // ... other columns ...
  //     {
  //       accessorKey: "iconKey",
  //       header: "Icon Key",
  //       cellRenderer: (item) => item.iconKey || "-", // Or render an <img> tag if you have the base URL
  //     },
  //     // ... other columns ...
  //   ];
  // }
  const categoryColumns = $derived(createMapPointCategoryColumns(currentLanguage));
  const mapPointColumns = $derived(createMapPointColumns(currentLanguage));

  // Form validation
  function handleCategorySubmit(event: SubmitEvent) {
    const error = createMapPointCategoryValidator()(categoryCrud.formData);
    if (error) {
      alert(error);
      event.preventDefault();
      return;
    }
    categoryCrud.saveItem()(event);
  }

  // Form validation with better error handling
  function handleMapPointSubmit(event: SubmitEvent) {
    // Don't convert categoryId to number here - keep it as string for the select field
    if (mapPointCrud.formData.latitude) {
      mapPointCrud.formData.latitude = Number(mapPointCrud.formData.latitude);
    }
    if (mapPointCrud.formData.longitude) {
      mapPointCrud.formData.longitude = Number(mapPointCrud.formData.longitude);
    }

    // Create a copy of formData with categoryId converted to number for validation
    const validationData = {
      ...mapPointCrud.formData,
      categoryId: Number(mapPointCrud.formData.categoryId),
    };

    const error = createMapPointValidator()(validationData);
    if (error) {
      alert(error);
      event.preventDefault();
      return;
    }
    mapPointCrud.saveItem()(event);
  }

  onMount(() => {
    loadCategories();
    loadMapPoints();
  });

  const categoryTableData = $derived(
    categories
      .map((category) => {
        // Count map points for this category
        // Ensure categoryId (string from form) is compared with category.id (number)
        const pointCount = mapPoints.filter((point) => Number(point.categoryId) === category.id).length;
        return {
          id: category.id,
          name: category.name, // Should be Record<string, string> from transformer
          iconKey: category.iconKey, // Add iconKey here
          mapPointsCount: pointCount,
        };
      })
      .sort((a, b) => {
        const nameA = getTranslation(a.name, currentLanguage, "de").toLowerCase();
        const nameB = getTranslation(b.name, currentLanguage, "de").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      })
  );

  const mapPointTableData = $derived(
    mapPoints
      .map((point) => {
        // The point object from mapPoints should already contain a transformed category object
        // if the mapPointTransformers.transformApiToForm is working correctly.
        return {
          id: point.id,
          name: point.name, // Should be Record<string, string>
          description: point.description, // Should be Record<string, string>
          categoryId: point.categoryId, // String
          latitude: point.latitude,
          longitude: point.longitude,
          category: point.category, // This should be the transformed category object {id, name: Record<string,string>}
        };
      })
      .sort((a, b) => {
        const categoryNameA = a.category ? getTranslation(a.category.name, currentLanguage, "de").toLowerCase() : "";
        const categoryNameB = b.category ? getTranslation(b.category.name, currentLanguage, "de").toLowerCase() : "";
        const pointNameA = getTranslation(a.name, currentLanguage, "de").toLowerCase();
        const pointNameB = getTranslation(b.name, currentLanguage, "de").toLowerCase();

        if (categoryNameA < categoryNameB) return -1;
        if (categoryNameA > categoryNameB) return 1;

        // If categories are the same, sort by point name
        if (pointNameA < pointNameB) return -1;
        if (pointNameA > pointNameB) return 1;

        return 0;
      })
  );
</script>

<div class="space-y-6">
  <!-- Header with Tabs -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold">Karten Verwaltung</h1>
      <p class="text-sm text-muted-foreground mt-1">Verwalten Sie Kategorien und Kartenpunkte</p>
    </div>
    <div class="flex items-center space-x-2">
      <label for="language-select" class="text-sm text-muted-foreground">Anzeigesprache:</label>
      <select
        id="language-select"
        value={currentLanguage}
        onchange={(e) => (currentLanguage = e.currentTarget.value)}
        class="text-sm border border-input rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each languages as lang}
          <option value={lang.code}>{lang.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="border-b border-border">
    <nav class="-mb-px flex space-x-8">
      <button
        onclick={() => (activeTab = "categories")}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 {activeTab ===
        'categories'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}"
      >
        Kategorien ({categories.length})
      </button>
      <button
        onclick={() => (activeTab = "points")}
        class="py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 {activeTab ===
        'points'
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}"
      >
        Kartenpunkte ({mapPoints.length})
      </button>
    </nav>
  </div>

  <!-- Tab Content -->
  {#if activeTab === "categories"}
    <AdminSection
      title="Kategorien"
      {languages}
      {currentLanguage}
      onLanguageChange={(lang) => (currentLanguage = lang)}
      columns={categoryColumns}
      data={categoryTableData}
      onCreate={() => categoryCrud.openCreateModal(categoryInitialFormData)}
      onEdit={(item) => categoryCrud.openEditModal(item)}
      onDelete={(id) =>
        categoryCrud.deleteItem(
          id,
          "Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Alle zugehörigen Kartenpunkte werden ebenfalls gelöscht."
        )}
      createButtonText="Neue Kategorie hinzufügen"
      emptyStateTitle="Keine Kategorien vorhanden"
      emptyStateDescription="Erstellen Sie Ihre erste Kategorie für Kartenpunkte."
    />
  {:else if activeTab === "points"}
    <AdminSection
      title="Kartenpunkte"
      {languages}
      {currentLanguage}
      onLanguageChange={(lang) => (currentLanguage = lang)}
      columns={mapPointColumns}
      data={mapPointTableData}
      onCreate={() => mapPointCrud.openCreateModal(mapPointInitialFormData)}
      onEdit={(item) => mapPointCrud.openEditModal(item)}
      onDelete={(id) => mapPointCrud.deleteItem(id, "Sind Sie sicher, dass Sie diesen Kartenpunkt löschen möchten?")}
      createButtonText="Neuen Kartenpunkt hinzufügen"
      emptyStateTitle="Keine Kartenpunkte vorhanden"
      emptyStateDescription="Erstellen Sie Ihren ersten Kartenpunkt."
    />
  {/if}
</div>

<!-- Category Modal -->
<MultiLanguageFormModal
  show={categoryCrud.showModal}
  title={categoryCrud.editingItem ? "Kategorie bearbeiten" : "Kategorie erstellen"}
  {languages}
  currentLanguage={categoryCrud.modalLanguage}
  onLanguageChange={(lang) => (categoryCrud.modalLanguage = lang)}
  onClose={categoryCrud.closeModal}
  onSubmit={handleCategorySubmit}
  submitText={categoryCrud.editingItem ? "Aktualisieren" : "Erstellen"}
  formFields={categoryFormFields}
  formData={categoryCrud.formData}
/>

<!-- Map Point Modal -->
<MultiLanguageFormModal
  show={mapPointCrud.showModal}
  title={mapPointCrud.editingItem ? "Kartenpunkt bearbeiten" : "Kartenpunkt erstellen"}
  {languages}
  currentLanguage={mapPointCrud.modalLanguage}
  onLanguageChange={(lang) => (mapPointCrud.modalLanguage = lang)}
  onClose={mapPointCrud.closeModal}
  onSubmit={handleMapPointSubmit}
  submitText={mapPointCrud.editingItem ? "Aktualisieren" : "Erstellen"}
  formFields={enhancedMapPointFormFields()}
  formData={mapPointCrud.formData}
/>

{#if loading || categoryCrud.loading || mapPointCrud.loading}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-center text-sm text-gray-600">
        {loading ? "Lade Daten..." : categoryCrud.loading ? "Speichere Kategorie..." : "Speichere Kartenpunkt..."}
      </p>
    </div>
  </div>
{/if}
