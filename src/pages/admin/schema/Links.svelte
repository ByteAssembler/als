<script lang="ts">
  import AdminPageLayout from "../../../components/admin/AdminPageLayout.svelte";
  import TranslationBadge from "../../../components/ui/TranslationBadge.svelte";
  import type { FormField } from "../../../components/ui/MultiLanguageFormModal.svelte";
  import type { Column, DataItem } from "../../../components/ui/DataTable.svelte";
  import { trpcAuthQuery } from "../../api/trpc/trpc.js";

  const languages = [
    { code: "de", name: "Deutsch" },
    { code: "en", name: "English" },
    { code: "it", name: "Italienisch" },
  ];

  let currentLanguage = $state("de");
  let data: DataItem[] = $state([]);
  let loading = $state(false);
  let showModal = $state(false);
  let editingItem: DataItem | null = $state(null);
  let modalLanguage = $state("de");
  let formData = $state<Record<string, any>>({});

  const columns: Column[] = [
    {
      header: "Name",
      key: "name",
      primary: true,
      render: (item) => {
        const name = item.name || "Unbenannt";
        const badge = item.names?.length > 0 ? `<span class="inline-block">${TranslationBadge}</span>` : "";
        return `${name}${badge}`;
      },
    },
    {
      header: "URL",
      key: "url",
      render: (item) =>
        `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${item.url}</a>`,
    },
    {
      header: "Beschreibung",
      key: "description",
      render: (item) => {
        const desc = item.description || "-";
        const hasDescriptions = item.descriptions?.length > 0;
        return hasDescriptions ? `${desc} <span class="text-xs text-amber-600">⚠</span>` : desc;
      },
    },
  ];

  const formFields: FormField[] = [
    {
      id: "name",
      label: "Name",
      type: "text",
      required: true,
      multilingual: true,
      placeholder: "z.B. Wikipedia",
      helpText: "Der angezeigte Name des Links",
    },
    {
      id: "description",
      label: "Beschreibung",
      type: "textarea",
      multilingual: true,
      placeholder: "Optionale Beschreibung des Links",
      helpText: "Eine kurze Beschreibung was sich hinter dem Link verbirgt",
    },
    {
      id: "url",
      label: "URL",
      type: "text",
      required: true,
      multilingual: false,
      placeholder: "https://example.com",
      helpText: "Die vollständige URL des Links",
    },
  ];

  const initialFormData = {
    name: { de: "", en: "" },
    description: { de: "", en: "" },
    url: "",
  };

  async function loadData() {
    try {
      loading = true;
      const result = await trpcAuthQuery(
        currentLanguage === "de" ? "link.list" : "link.list_by_language",
        ...(currentLanguage === "de" ? [] : [currentLanguage])
      );
      data = result || [];
    } catch (error) {
      console.error("Fehler beim Laden der Links:", error);
      data = [];
    } finally {
      loading = false;
    }
  }

  function openCreateModal(initialData?: Record<string, any>) {
    editingItem = null;
    formData = { ...(initialData || initialFormData) };
    modalLanguage = "de";
    showModal = true;
  }

  function openEditModal(item: DataItem) {
    editingItem = item;
    formData = {
      name: item.names?.reduce((acc: Record<string, string>, name: any) => {
        acc[name.language] = name.text;
        return acc;
      }, {}) || { de: item.name || "", en: "" },
      description: item.descriptions?.reduce((acc: Record<string, string>, desc: any) => {
        acc[desc.language] = desc.text;
        return acc;
      }, {}) || { de: item.description || "", en: "" },
      url: item.url || "",
    };
    modalLanguage = "de";
    showModal = true;
  }

  async function deleteItem(id: string | number, confirmMessage = "Möchten Sie diesen Link wirklich löschen?") {
    if (!confirm(confirmMessage)) return;

    try {
      loading = true;
      await trpcAuthQuery("link.delete", Number(id));
      await loadData();
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      alert("Fehler beim Löschen des Links");
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    showModal = false;
    editingItem = null;
    formData = { ...initialFormData };
  }

  function saveItem() {
    return async (event: SubmitEvent) => {
      event.preventDefault();

      try {
        loading = true;

        if (editingItem) {
          // Update payload with required id
          const updatePayload = {
            id: Number(editingItem.id),
            name: formData.name,
            description: formData.description,
            url: formData.url,
          };
          await trpcAuthQuery("link.update", updatePayload);
        } else {
          // Create payload without id
          const createPayload = {
            name: formData.name,
            description: formData.description,
            url: formData.url,
          };
          await trpcAuthQuery("link.create", createPayload);
        }

        closeModal();
        await loadData();
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Fehler beim Speichern des Links");
      } finally {
        loading = false;
      }
    };
  }

  // Create crud object with proper state accessors
  const crud = $derived({
    showModal,
    editingItem,
    modalLanguage,
    formData,
    loading,
    openCreateModal,
    openEditModal,
    deleteItem,
    closeModal,
    saveItem,
  });

  // Load data on component mount and language change
  $effect(() => {
    loadData();
  });
</script>

<AdminPageLayout
  title="Link Verwaltung"
  {languages}
  {currentLanguage}
  onLanguageChange={(lang) => (currentLanguage = lang)}
  {columns}
  {data}
  {crud}
  {formFields}
  {initialFormData}
  createButtonText="Neuen Link hinzufügen"
  emptyStateTitle="Keine Links vorhanden"
  emptyStateDescription="Erstellen Sie Ihren ersten Link, um zu beginnen."
  deleteConfirmMessage="Möchten Sie diesen Link wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
/>
