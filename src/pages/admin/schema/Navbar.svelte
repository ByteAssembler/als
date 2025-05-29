<script>
  import LanguageSelector from "../../../components/ui/LanguageSelector.svelte";
  import DataTable from "../../../components/ui/DataTable.svelte";
  import LanguageModal from "../../../components/ui/LanguageModal.svelte";
  import { getTranslation, hasTranslation } from "../../../lib/utils/translation.js";
  import { trpcAuthQuery } from "../../api/trpc/trpc.js";

  const languages = [
    { code: "de", name: "Deutsch" },
    { code: "en", name: "English" },
    { code: "it", name: "Italienisch" },
  ];

  let currentLanguage = $state("de");
  let showModal = $state(false);
  let editingNavbar = $state(null);
  let modalLanguage = $state("de");
  let loading = $state(false);
  let error = $state(null);

  let navbars = $state([]);

  let formData = $state({
    text: {},
    href: "",
    withLanguagePrefix: false,
  });

  function getAuthToken() {
    return localStorage.getItem("auth_token") || "mock-token";
  }

  async function loadNavbars() {
    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();
      const apiNavbars = await trpcAuthQuery("navbar.list_by_language", authToken, currentLanguage);

      navbars = apiNavbars.map((navbar) => ({
        id: navbar.id,
        text: { [currentLanguage]: navbar.text },
        href: navbar.href,
        withLanguagePrefix: navbar.withLanguagePrefix,
      }));
    } catch (err) {
      console.error("Failed to load navbars:", err);
      error = err.message;
      // Fallback to mock data for development
      navbars = [
        {
          id: 1,
          text: { de: "Startseite", en: "Home" },
          href: "/",
          withLanguagePrefix: true,
        },
        {
          id: 2,
          text: { de: "Über uns", en: "About" },
          href: "/about",
          withLanguagePrefix: true,
        },
      ];
    } finally {
      loading = false;
    }
  }

  // Load data when component mounts or language changes
  $effect(() => {
    loadNavbars();
  });

  // Table columns configuration
  const columns = $derived([
    {
      key: "text",
      header: "Text",
      primary: true,
      render: (item) => {
        const translation = getTranslation(item.text, currentLanguage);
        const warning = !hasTranslation(item.text, currentLanguage)
          ? `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Übersetzung fehlt</span>`
          : "";
        return `${translation}${warning}`;
      },
    },
    {
      key: "href",
      header: "Link",
      render: (item) => `<code class="bg-muted px-2 py-1 rounded text-sm">${item.href}</code>`,
    },
    {
      key: "withLanguagePrefix",
      header: "Sprachpräfix",
      render: (item) =>
        item.withLanguagePrefix
          ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ja</span>`
          : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Nein</span>`,
    },
  ]);

  function openCreateModal() {
    editingNavbar = null;
    formData = { text: {}, href: "", withLanguagePrefix: false };
    modalLanguage = "de";
    showModal = true;
  }

  function openEditModal(navbar) {
    editingNavbar = navbar;
    formData = {
      text: { ...navbar.text },
      href: navbar.href,
      withLanguagePrefix: navbar.withLanguagePrefix,
    };
    modalLanguage = "de";
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingNavbar = null;
  }

  async function saveNavbar(e) {
    e.preventDefault();

    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();

      // Clean up form data
      const cleanedText = {};

      for (const [lang, value] of Object.entries(formData.text)) {
        if (value && value.trim()) {
          cleanedText[lang] = value.trim();
        }
      }

      const navbarData = {
        text: cleanedText,
        href: formData.href,
        withLanguagePrefix: formData.withLanguagePrefix,
      };

      if (editingNavbar) {
        await trpcAuthQuery("navbar.update", authToken, {
          id: editingNavbar.id,
          ...navbarData,
        });
      } else {
        await trpcAuthQuery("navbar.create", authToken, navbarData);
      }

      await loadNavbars();
      closeModal();
    } catch (err) {
      console.error("Failed to save navbar:", err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function deleteNavbar(id) {
    if (confirm("Sind Sie sicher, dass Sie diesen Navbar-Eintrag löschen möchten?")) {
      try {
        loading = true;
        error = null;

        const authToken = getAuthToken();
        await trpcAuthQuery("navbar.delete", authToken, id);

        await loadNavbars();
      } catch (err) {
        console.error("Failed to delete navbar:", err);
        error = err.message;
      } finally {
        loading = false;
      }
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Navigation Verwaltung</h1>
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
        {showModal ? "Speichere..." : "Lade Navigation..."}
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
              loadNavbars();
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
      title="Navigation Verwaltung"
      {columns}
      data={navbars}
      onCreate={openCreateModal}
      onEdit={openEditModal}
      onDelete={deleteNavbar}
      createButtonText="Neuen Navbar-Eintrag hinzufügen"
      emptyStateTitle="Keine Navigation vorhanden"
      emptyStateDescription="Erstellen Sie Ihren ersten Navbar-Eintrag, um zu beginnen."
    />
  {/if}
</div>

<LanguageModal
  show={showModal}
  title={editingNavbar ? "Navbar bearbeiten" : "Neuen Navbar-Eintrag erstellen"}
  {languages}
  currentLanguage={modalLanguage}
  onLanguageChange={(lang) => (modalLanguage = lang)}
  onClose={closeModal}
  onSubmit={saveNavbar}
  submitText={editingNavbar ? "Aktualisieren" : "Erstellen"}
>
  {#snippet children()}
    <div>
      <label for="text" class="block text-sm font-medium mb-1">
        Text ({languages.find((l) => l.code === modalLanguage)?.name})
        {#if modalLanguage === "de"}
          <span aria-label="Pflichtfeld">*</span>
        {/if}
      </label>
      <input
        id="text"
        type="text"
        bind:value={formData.text[modalLanguage]}
        required={modalLanguage === "de"}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Navigation Text"
      />
      {#if modalLanguage !== "de"}
        <p class="mt-1 text-xs text-muted-foreground">Optional - falls leer, wird die deutsche Version verwendet</p>
      {/if}
    </div>

    <div>
      <label for="href" class="block text-sm font-medium mb-1">
        Link <span aria-label="Pflichtfeld">*</span>
      </label>
      <input
        id="href"
        type="text"
        bind:value={formData.href}
        required
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="/beispiel-seite"
      />
      <p class="mt-1 text-xs text-muted-foreground">
        Relativer oder absoluter Link (z.B. /about oder https://example.com)
      </p>
    </div>

    <div>
      <div class="flex items-center">
        <input
          id="withLanguagePrefix"
          type="checkbox"
          bind:checked={formData.withLanguagePrefix}
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="withLanguagePrefix" class="ml-2 block text-sm font-medium"> Mit Sprachpräfix </label>
      </div>
      <p class="mt-1 text-xs text-muted-foreground">
        Wenn aktiviert, wird automatisch die aktuelle Sprache vor den Link gesetzt (z.B. /de/about)
      </p>
    </div>
  {/snippet}
</LanguageModal>
