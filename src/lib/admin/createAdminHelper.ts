import type { FormField } from "@/components/ui/MultiLanguageFormModal.svelte";

// Generic data transformation interface
export interface DataTransformers<ApiType, FormType> {
  transformApiToForm: (apiData: ApiType) => FormType;
  transformFormToApi: (formData: FormType) => any;
}

// Generic form configuration
export interface FormConfig {
  formFields: FormField[];
  initialFormData: Record<string, any>;
}

// Generic CRUD configuration
export interface CrudConfig<ApiType, FormType> {
  onSave: (formData: FormType, isEdit: boolean, editingItem?: any) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  initialFormData: Record<string, any>;
}

// Generic CRUD functions factory
export function createCrudFunctions<ApiType, FormType>(
  config: CrudConfig<ApiType, FormType>
) {
  return {
    openCreateModal: (state: any, initialData = {}) => {
      state.editingItem = null;
      state.modalLanguage = "de";
      state.formData = { ...config.initialFormData, ...initialData };
      state.showModal = true;
    },

    openEditModal: (state: any, item: FormType) => {
      state.editingItem = item;
      state.modalLanguage = "de";
      // Use the item data directly since it's already transformed from the list
      state.formData = { ...item };
      state.showModal = true;
    },

    deleteItem: async (state: any, id: string | number, confirmMessage?: string) => {
      const message = confirmMessage || "Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?";
      if (confirm(message)) {
        try {
          state.loading = true;
          await config.onDelete(id);
        } catch (error) {
          console.error("Fehler beim Löschen:", error);
          alert("Fehler beim Löschen. Bitte versuchen Sie es erneut.");
        } finally {
          state.loading = false;
        }
      }
    },

    closeModal: (state: any) => {
      state.showModal = false;
      state.editingItem = null;
      state.formData = {};
    },

    saveItem: (state: any) => async (event: SubmitEvent) => {
      event.preventDefault();
      try {
        state.loading = true;
        await config.onSave(state.formData, !!state.editingItem, state.editingItem);
        state.showModal = false;
        state.editingItem = null;
        state.formData = {};
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
      } finally {
        state.loading = false;
      }
    }
  };
}

// Generic admin entity helper with proper type handling
export function createAdminEntityHelper<ApiType, FormType>(
  entityConfig: {
    formFields: FormField[];
    initialFormData: Record<string, any>;
    transformers: DataTransformers<ApiType, FormType>;
    apiMethods: {
      list: () => Promise<any[]>; // Keep flexible for API response
      create: (data: any) => Promise<any>;
      update: (data: any) => Promise<any>;
      delete: (id: number) => Promise<any>;
    };
  }
) {
  return {
    formConfig: {
      formFields: entityConfig.formFields,
      initialFormData: entityConfig.initialFormData
    },

    transformers: entityConfig.transformers,

    createCrud: (loadDataCallback: () => Promise<void>) => {
      return createCrudFunctions<ApiType, FormType>({
        onSave: async (formData, isEdit, editingItem) => {
          const apiData = entityConfig.transformers.transformFormToApi(formData);
          if (isEdit && editingItem) {
            await entityConfig.apiMethods.update({ id: Number(editingItem.id), ...apiData });
          } else {
            await entityConfig.apiMethods.create(apiData);
          }
          await loadDataCallback();
        },
        onDelete: async (id) => {
          await entityConfig.apiMethods.delete(Number(id));
          await loadDataCallback();
        },
        initialFormData: entityConfig.initialFormData
      });
    },

    loadData: async (): Promise<FormType[]> => {
      const result = await entityConfig.apiMethods.list();
      // Fix: Explicitly type the map callback parameter
      return result.map((item: any): FormType =>
        entityConfig.transformers.transformApiToForm(item as ApiType)
      );
    }
  };
}
