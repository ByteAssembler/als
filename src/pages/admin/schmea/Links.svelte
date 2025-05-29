<script>
  import LanguageSelector from "../../../components/ui/LanguageSelector.svelte";
  import DataTable from "../../../components/ui/DataTable.svelte";
  import LanguageModal from "../../../components/ui/LanguageModal.svelte";
  import { getTranslation, hasTranslation } from "../../../lib/utils/translation.js";
  import { trpcAuthQuery } from "../../api/trpc/trpc.js";

  const languages = [
    { code: "de", name: "Deutsch" },
    { code: "en", name: "English" },
  ];

  let currentLanguage = $state("de");
  let showModal = $state(false);
  let editingLink = $state(null);
  let modalLanguage = $state("de");
  let loading = $state(false);
  let error = $state(null);

  let links = $state([]);

  let formData = $state({
    name: {},
    description: {},
    url: "",
  });

  function getAuthToken() {
    return localStorage.getItem("auth_token") || "mock-token";
  }

  async function loadLinks() {
    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();
      const apiLinks = await trpcAuthQuery("link.list_by_language", authToken, currentLanguage);

      // For now, use simple transformation until the modular system is fully working
      links = apiLinks.map((link) => ({
        id: link.id,
        name: { [currentLanguage]: link.name },
        description: { [currentLanguage]: link.description },
        url: link.url,
      }));
    } catch (err) {
      console.error("Failed to load links:", err);
      error = err.message;
      // Fallback to mock data for development
      links = [
        {
          id: 1,
          name: { de: "Startseite", en: "Homepage" },
          description: { de: "Hauptseite der Website", en: "Main homepage link" },
          url: "https://example.com",
        },
        {
          id: 2,
          name: { de: "Über uns", en: "About Us" },
          description: { de: "Informationen über unser Unternehmen", en: "Information about our company" },
          url: "https://example.com/about",
        },
      ];
    } finally {
      loading = false;
    }
  }

  // Load data when component mounts or language changes
  $effect(() => {
    loadLinks();
  });

  // Table columns configuration
  const columns = $derived([
    {
      key: "name",
      header: "Name",
      primary: true,
      render: (item) => {
        const translation = getTranslation(item.name, currentLanguage);
        const warning = !hasTranslation(item.name, currentLanguage)
          ? `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Übersetzung fehlt</span>`
          : "";
        return `${translation}${warning}`;
      },
    },
    {
      key: "description",
      header: "Beschreibung",
      render: (item) => {
        const translation = getTranslation(item.description, currentLanguage);
        const warning =
          item.description &&
          Object.keys(item.description).length > 0 &&
          !hasTranslation(item.description, currentLanguage)
            ? `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Übersetzung fehlt</span>`
            : "";
        return `<span class="max-w-xs truncate">${translation}</span>${warning}`;
      },
    },
    {
      key: "url",
      header: "URL",
      render: (item) =>
        `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 transition-colors underline">${item.url}</a>`,
    },
  ]);

  function openCreateModal() {
    editingLink = null;
    formData = { name: {}, description: {}, url: "" };
    modalLanguage = "de";
    showModal = true;
  }

  function openEditModal(link) {
    editingLink = link;
    formData = {
      name: { ...link.name },
      description: { ...link.description },
      url: link.url,
    };
    modalLanguage = "de";
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingLink = null;
  }

  async function saveLink(e) {
    e.preventDefault();

    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();

      // Clean up form data
      const cleanedName = {};
      const cleanedDescription = {};

      for (const [lang, value] of Object.entries(formData.name)) {
        if (value && value.trim()) {
          cleanedName[lang] = value.trim();
        }
      }

      for (const [lang, value] of Object.entries(formData.description)) {
        if (value && value.trim()) {
          cleanedDescription[lang] = value.trim();
        }
      }

      const linkData = {
        name: cleanedName,
        description: Object.keys(cleanedDescription).length > 0 ? cleanedDescription : undefined,
        url: formData.url,
      };

      if (editingLink) {
        await trpcAuthQuery("link.update", authToken, {
          id: editingLink.id,
          ...linkData,
        });
      } else {
        await trpcAuthQuery("link.create", authToken, linkData);
      }

      await loadLinks();
      closeModal();
    } catch (err) {
      console.error("Failed to save link:", err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function deleteLink(id) {
    if (confirm("Sind Sie sicher, dass Sie diesen Link löschen möchten?")) {
      try {
        loading = true;
        error = null;

        const authToken = getAuthToken();
        await trpcAuthQuery("link.delete", authToken, id);

        await loadLinks();
      } catch (err) {
        console.error("Failed to delete link:", err);
        error = err.message;
      } finally {
        loading = false;
      }
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Links Verwaltung</h1>
    <LanguageSelector
      {languages}
      {currentLanguage}
      onLanguageChange={(lang) => (currentLanguage = lang)}
      label="Anzeigesprache:"
    />
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-2 text-muted-foreground">
        {showModal ? "Speichere..." : "Lade Links..."}
      </span>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Fehler</h3>
          <p class="mt-1 text-sm text-red-700">{error}</p>
          <button
            onclick={() => {
              error = null;
              loadLinks();
            }}
            class="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    </div>
  {:else}
    <DataTable
      title="Links Verwaltung"
      {columns}
      data={links}
      onCreate={openCreateModal}
      onEdit={openEditModal}
      onDelete={deleteLink}
      createButtonText="Neuen Link hinzufügen"
      emptyStateTitle="Keine Links vorhanden"
      emptyStateDescription="Erstellen Sie Ihren ersten Link, um zu beginnen."
    />
  {/if}
</div>

<LanguageModal
  show={showModal}
  title={editingLink ? "Link bearbeiten" : "Neuen Link erstellen"}
  {languages}
  currentLanguage={modalLanguage}
  onLanguageChange={(lang) => (modalLanguage = lang)}
  onClose={closeModal}
  onSubmit={saveLink}
  submitText={editingLink ? "Aktualisieren" : "Erstellen"}
>
  {#snippet children()}
    <div>
      <label for="name" class="block text-sm font-medium mb-1">
        Name ({languages.find((l) => l.code === modalLanguage)?.name})
        {#if modalLanguage === "de"}
          <span aria-label="Pflichtfeld">*</span>
        {/if}
      </label>
      <input
        id="name"
        type="text"
        bind:value={formData.name[modalLanguage]}
        required={modalLanguage === "de"}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Link Name"
      />
      {#if modalLanguage !== "de"}
        <p class="mt-1 text-xs text-muted-foreground">Optional - falls leer, wird die deutsche Version verwendet</p>
      {/if}
    </div>

    <div>
      <label for="description" class="block text-sm font-medium mb-1">
        Beschreibung ({languages.find((l) => l.code === modalLanguage)?.name})
      </label>
      <textarea
        id="description"
        bind:value={formData.description[modalLanguage]}
        rows="3"
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="Optionale Beschreibung des Links"
      ></textarea>
    </div>

    <div>
      <label for="url" class="block text-sm font-medium mb-1">
        URL <span aria-label="Pflichtfeld">*</span>
      </label>
      <input
        id="url"
        type="url"
        bind:value={formData.url}
        required
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="https://example.com"
      />
      <p class="mt-1 text-xs text-muted-foreground">Vollständige URL inklusive https://</p>
    </div>
  {/snippet}
</LanguageModal>
