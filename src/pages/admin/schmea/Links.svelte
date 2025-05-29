<script>
  import LanguageSelector from "../../../components/ui/LanguageSelector.svelte";
  import DataTable from "../../../components/ui/DataTable.svelte";
  import LanguageModal from "../../../components/ui/LanguageModal.svelte";
  import { trpcAuthQuery } from "../../api/trpc/trpc.js";
  import { onMount } from "svelte";

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

  let links = $state(loadLinks());
  onMount(() => loadLinks());

  let formData = $state({
    name: {},
    description: {},
    url: "",
  });

  // Define columns for the DataTable
  // This needs to be reactive to currentLanguage for Name and Description
  const columns = $derived([
    {
      key: "name",
      label: `Name (${currentLanguage.toUpperCase()})`,
      render: (link) => link.name[currentLanguage] || link.name["de"] || "N/A", // Fallback to German or N/A
    },
    {
      key: "description",
      label: `Beschreibung (${currentLanguage.toUpperCase()})`,
      render: (link) => link.description[currentLanguage] || link.description["de"] || "-", // Fallback to German or '-'
    },
    { key: "url", label: "URL" },
  ]);

  function getAuthToken() {
    return localStorage.getItem("auth_token") || "mock-token";
  }

  async function loadLinks() {
    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();
      const apiLinks = await trpcAuthQuery("link.list", authToken);
      console.log("Loaded links:", apiLinks);

      links = apiLinks.map((link) => {
        const nameRecord = {};
        link.names.forEach((item) => {
          nameRecord[item.language] = item.text;
        });

        const descriptionRecord = {};
        if (link.descriptions && link.descriptions.length > 0) {
          link.descriptions.forEach((item) => {
            descriptionRecord[item.language] = item.text;
          });
        }

        return {
          id: link.id,
          name: nameRecord,
          description: descriptionRecord,
          url: link.url,
        };
      });
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

  function openCreateModal() {
    editingLink = null;
    formData = { name: {}, description: {}, url: "" };
    modalLanguage = "de";
    showModal = true;
  }

  function openEditModal(link) {
    editingLink = link;
    // Since we already have all translations, we can use them directly
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

      const cleanedName = {};
      for (const [lang, value] of Object.entries(formData.name)) {
        if (value && value.trim()) {
          cleanedName[lang] = value.trim();
        }
      }

      const cleanedDescription = {};
      for (const [lang, value] of Object.entries(formData.description)) {
        if (value && value.trim()) {
          cleanedDescription[lang] = value.trim();
        }
      }

      if (!editingLink && Object.keys(cleanedName).length === 0) {
        throw new Error("At least one name translation is required for a new link.");
      }
      // For updates, if cleanedName is {}, it implies clearing all names, which is allowed by sending name: {}

      if (editingLink) {
        const updatePayload = {
          id: editingLink.id,
          name: cleanedName, // Sending {} will clear names if all name fields were emptied
          description: Object.keys(cleanedDescription).length > 0 ? cleanedDescription : null,
          url: formData.url,
        };
        await trpcAuthQuery("link.update", authToken, updatePayload);
      } else {
        const createPayload = {
          name: cleanedName, // Already validated to be non-empty for new links
          description: Object.keys(cleanedDescription).length > 0 ? cleanedDescription : undefined,
          url: formData.url,
        };
        await trpcAuthQuery("link.create", authToken, createPayload);
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
