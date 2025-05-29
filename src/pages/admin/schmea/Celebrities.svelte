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
  let editingCelebrity = $state(null);
  let modalLanguage = $state("de");
  let loading = $state(false);
  let error = $state(null);

  let celebrities = $state([]);

  let formData = $state({
    name: "",
    bio: {},
    profession: {},
    born: "",
    died: "",
    alsYear: "",
    imageKey: "",
  });

  function getAuthToken() {
    return localStorage.getItem("auth_token") || "mock-token";
  }

  async function loadCelebrities() {
    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();
      const apiCelebrities = await trpcAuthQuery("celebrity.list_by_language", authToken, currentLanguage);

      celebrities = apiCelebrities.map((celebrity) => ({
        id: celebrity.id,
        name: celebrity.name,
        bio: { [currentLanguage]: celebrity.bio },
        profession: { [currentLanguage]: celebrity.profession },
        born: celebrity.born,
        died: celebrity.died,
        alsYear: celebrity.alsYear,
        imageKey: celebrity.imageKey,
      }));
    } catch (err) {
      console.error("Failed to load celebrities:", err);
      error = err.message;
      // Fallback to mock data for development
      celebrities = [
        {
          id: 1,
          name: "Stephen Hawking",
          bio: { de: "Berühmter Physiker mit ALS", en: "Famous physicist with ALS" },
          profession: { de: "Physiker", en: "Physicist" },
          born: "1942-01-08",
          died: "2018-03-14",
          alsYear: 1963,
          imageKey: "",
        },
        {
          id: 2,
          name: "Jason Becker",
          bio: { de: "Gitarrist und Komponist mit ALS", en: "Guitarist and composer with ALS" },
          profession: { de: "Musiker", en: "Musician" },
          born: "1969-07-22",
          died: "",
          alsYear: 1989,
          imageKey: "",
        },
      ];
    } finally {
      loading = false;
    }
  }

  async function loadCelebrityTranslations(celebrityId) {
    try {
      const authToken = getAuthToken();
      const response = await trpcAuthQuery("celebrity.get", authToken, { id: celebrityId });

      if (response) {
        // Transformiere die API-Antwort in unser FormData-Format
        const name = response.name;

        // Bio-Übersetzungen
        const bioTranslations = {};
        if (response.bios && Array.isArray(response.bios)) {
          response.bios.forEach((item) => {
            bioTranslations[item.language] = item.text;
          });
        }

        // Berufs-Übersetzungen
        const professionTranslations = {};
        if (response.professions && Array.isArray(response.professions)) {
          response.professions.forEach((item) => {
            professionTranslations[item.language] = item.text;
          });
        }

        return {
          name,
          bio: bioTranslations,
          profession: professionTranslations,
          born: response.born,
          died: response.died || "",
          alsYear: response.alsYear?.toString() || "",
          imageKey: response.imageKey || "",
        };
      }
      return null;
    } catch (err) {
      console.error("Failed to load celebrity translations:", err);
      return null;
    }
  }

  $effect(() => {
    loadCelebrities();
  });

  const columns = $derived([
    {
      key: "name",
      header: "Name",
      primary: true,
      render: (item) => item.name,
    },
    {
      key: "profession",
      header: "Beruf",
      render: (item) => {
        const translation = getTranslation(item.profession, currentLanguage);
        const warning = !hasTranslation(item.profession, currentLanguage)
          ? `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Übersetzung fehlt</span>`
          : "";
        return `${translation}${warning}`;
      },
    },
    {
      key: "alsYear",
      header: "ALS Jahr",
      render: (item) => item.alsYear || "-",
    },
    {
      key: "lifespan",
      header: "Lebensspanne",
      render: (item) => {
        const bornYear = new Date(item.born).getFullYear();
        const diedYear = item.died ? new Date(item.died).getFullYear() : "heute";
        return `${bornYear} - ${diedYear}`;
      },
    },
  ]);

  function openCreateModal() {
    editingCelebrity = null;
    formData = {
      name: "",
      bio: {},
      profession: {},
      born: "",
      died: "",
      alsYear: "",
      imageKey: "",
    };
    modalLanguage = "de";
    showModal = true;
  }

  function openEditModal(celebrity) {
    editingCelebrity = celebrity;
    loading = true; // Zeige Ladeindikator während wir die Daten abrufen

    loadCelebrityTranslations(celebrity.id)
      .then((fullTranslations) => {
        if (fullTranslations) {
          formData = {
            name: fullTranslations.name,
            bio: fullTranslations.bio,
            profession: fullTranslations.profession,
            born: fullTranslations.born,
            died: fullTranslations.died,
            alsYear: fullTranslations.alsYear,
            imageKey: fullTranslations.imageKey,
          };
        } else {
          // Fallback zu den aktuellen Daten (nur aktuelle Sprache)
          formData = {
            name: celebrity.name,
            bio: { [currentLanguage]: getTranslation(celebrity.bio, currentLanguage) },
            profession: { [currentLanguage]: getTranslation(celebrity.profession, currentLanguage) },
            born: celebrity.born,
            died: celebrity.died || "",
            alsYear: celebrity.alsYear?.toString() || "",
            imageKey: celebrity.imageKey || "",
          };
        }
        modalLanguage = "de"; // Standardmäßig Deutsch auswählen
        showModal = true;
        loading = false;
      })
      .catch(() => {
        loading = false;
      });
  }

  function closeModal() {
    showModal = false;
    editingCelebrity = null;
  }

  async function saveCelebrity(e) {
    e.preventDefault();

    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();

      const cleanedBio = {};
      const cleanedProfession = {};

      for (const [lang, value] of Object.entries(formData.bio)) {
        if (value && value.trim()) {
          cleanedBio[lang] = value.trim();
        }
      }

      for (const [lang, value] of Object.entries(formData.profession)) {
        if (value && value.trim()) {
          cleanedProfession[lang] = value.trim();
        }
      }

      const celebrityData = {
        name: formData.name.trim(),
        bio: cleanedBio,
        profession: cleanedProfession,
        born: formData.born,
        died: formData.died || undefined,
        alsYear: parseInt(formData.alsYear) || undefined,
        imageKey: formData.imageKey || undefined,
      };

      if (editingCelebrity) {
        await trpcAuthQuery("celebrity.update", authToken, {
          id: editingCelebrity.id,
          ...celebrityData,
        });
      } else {
        await trpcAuthQuery("celebrity.create", authToken, celebrityData);
      }

      await loadCelebrities();
      closeModal();
    } catch (err) {
      console.error("Failed to save celebrity:", err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function deleteCelebrity(id) {
    if (confirm("Sind Sie sicher, dass Sie diese Persönlichkeit löschen möchten?")) {
      try {
        loading = true;
        error = null;

        const authToken = getAuthToken();
        await trpcAuthQuery("celebrity.delete", authToken, id);

        await loadCelebrities();
      } catch (err) {
        console.error("Failed to delete celebrity:", err);
        error = err.message;
      } finally {
        loading = false;
      }
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Berühmte Persönlichkeiten Verwaltung</h1>
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
        {showModal ? "Speichere..." : "Lade Persönlichkeiten..."}
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
              loadCelebrities();
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
      title="Berühmte Persönlichkeiten"
      {columns}
      data={celebrities}
      onCreate={openCreateModal}
      onEdit={openEditModal}
      onDelete={deleteCelebrity}
      createButtonText="Neue Persönlichkeit hinzufügen"
      emptyStateTitle="Keine Persönlichkeiten vorhanden"
      emptyStateDescription="Erstellen Sie Ihre erste Persönlichkeit, um zu beginnen."
    />
  {/if}
</div>

<!-- Modal Template anpassen -->
<LanguageModal
  show={showModal}
  title={editingCelebrity ? "Persönlichkeit bearbeiten" : "Neue Persönlichkeit erstellen"}
  {languages}
  currentLanguage={modalLanguage}
  onLanguageChange={(lang) => (modalLanguage = lang)}
  onClose={closeModal}
  onSubmit={saveCelebrity}
  submitText={editingCelebrity ? "Aktualisieren" : "Erstellen"}
>
  {#snippet children()}
    <div>
      <label for="name" class="block text-sm font-medium mb-1">
        Name <span aria-label="Pflichtfeld">*</span>
      </label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        required
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Name der Persönlichkeit"
      />
    </div>

    <div>
      <label for="bio" class="block text-sm font-medium mb-1">
        Biografie ({languages.find((l) => l.code === modalLanguage)?.name})
        {#if modalLanguage === "de"}
          <span aria-label="Pflichtfeld">*</span>
        {/if}
      </label>
      <textarea
        id="bio"
        bind:value={formData.bio[modalLanguage]}
        rows="4"
        required={modalLanguage === "de"}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="Biografische Informationen"
      ></textarea>
      {#if modalLanguage !== "de"}
        <p class="mt-1 text-xs text-muted-foreground">Optional - falls leer, wird die deutsche Version verwendet</p>
      {/if}
    </div>

    <div>
      <label for="profession" class="block text-sm font-medium mb-1">
        Beruf ({languages.find((l) => l.code === modalLanguage)?.name})
        {#if modalLanguage === "de"}
          <span aria-label="Pflichtfeld">*</span>
        {/if}
      </label>
      <input
        id="profession"
        type="text"
        bind:value={formData.profession[modalLanguage]}
        required={modalLanguage === "de"}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Beruf der Persönlichkeit"
      />
      {#if modalLanguage !== "de"}
        <p class="mt-1 text-xs text-muted-foreground">Optional - falls leer, wird die deutsche Version verwendet</p>
      {/if}
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="born" class="block text-sm font-medium mb-1">
          Geburtsdatum <span aria-label="Pflichtfeld">*</span>
        </label>
        <input
          id="born"
          type="date"
          bind:value={formData.born}
          required
          class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label for="died" class="block text-sm font-medium mb-1"> Todesdatum (optional) </label>
        <input
          id="died"
          type="date"
          bind:value={formData.died}
          class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    <div>
      <label for="alsYear" class="block text-sm font-medium mb-1"> ALS Diagnosejahr (optional) </label>
      <input
        id="alsYear"
        type="number"
        bind:value={formData.alsYear}
        min="1900"
        max={new Date().getFullYear()}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Jahr der ALS-Diagnose"
      />
    </div>

    <div>
      <label for="imageKey" class="block text-sm font-medium mb-1"> Bild (optional) </label>
      <input
        id="imageKey"
        type="text"
        bind:value={formData.imageKey}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Dateischlüssel des Bildes"
      />
    </div>
  {/snippet}
</LanguageModal>
