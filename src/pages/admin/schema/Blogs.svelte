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
  let editingBlog = $state(null);
  let modalLanguage = $state("de");
  let loading = $state(false);
  let error = $state(null);

  let blogs = $state([]);

  let formData = $state({
    title: {},
    content: {},
    slug: "",
    authors: [],
    coverImageKey: "",
  });

  function getAuthToken() {
    return localStorage.getItem("auth_token") || "mock-token";
  }

  async function loadBlogs() {
    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();
      const apiBlogs = await trpcAuthQuery("blog.list", authToken, currentLanguage);

      blogs = apiBlogs.map((blog) => ({
        id: blog.id,
        title: { [currentLanguage]: blog.title },
        content: { [currentLanguage]: blog.content },
        slug: blog.slug,
        authors: blog.authors,
        coverImageKey: blog.coverImageKey,
        publishedAt: blog.publishedAt,
      }));
    } catch (err) {
      console.error("Failed to load blogs:", err);
      error = err.message;
      // Fallback to mock data for development
      blogs = [
        {
          id: 1,
          title: { de: "Erster Blogbeitrag", en: "First blog post" },
          content: { de: "Inhalt des ersten Blogbeitrags", en: "Content of the first blog post" },
          slug: "erster-blogbeitrag",
          authors: ["Autor 1"],
          coverImageKey: "",
          publishedAt: new Date(),
        },
        {
          id: 2,
          title: { de: "Zweiter Blogbeitrag", en: "Second blog post" },
          content: { de: "Inhalt des zweiten Blogbeitrags", en: "Content of the second blog post" },
          slug: "zweiter-blogbeitrag",
          authors: ["Autor 1", "Autor 2"],
          coverImageKey: "",
          publishedAt: new Date(),
        },
      ];
    } finally {
      loading = false;
    }
  }

  async function loadBlogTranslations(blogId) {
    try {
      const authToken = getAuthToken();
      const allBlogs = await trpcAuthQuery("blog.list", authToken);
      const blogWithAllTranslations = allBlogs.find((blog) => blog.id === blogId);

      if (blogWithAllTranslations) {
        const titleTranslations = {};
        const contentTranslations = {};

        blogWithAllTranslations.titles.forEach((item) => {
          titleTranslations[item.language] = item.text;
        });

        blogWithAllTranslations.contents.forEach((item) => {
          contentTranslations[item.language] = item.text;
        });

        return {
          title: titleTranslations,
          content: contentTranslations,
          slug: blogWithAllTranslations.slug,
          authors: blogWithAllTranslations.authors,
          coverImageKey: blogWithAllTranslations.coverImageKey,
        };
      }
      return null;
    } catch (err) {
      console.error("Failed to load blog translations:", err);
      return null;
    }
  }

  $effect(() => {
    loadBlogs();
  });

  const columns = $derived([
    {
      key: "title",
      header: "Titel",
      primary: true,
      render: (item) => {
        const translation = getTranslation(item.title, currentLanguage);
        const warning = !hasTranslation(item.title, currentLanguage)
          ? `<span class="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Übersetzung fehlt</span>`
          : "";
        return `${translation}${warning}`;
      },
    },
    {
      key: "slug",
      header: "Slug",
      render: (item) => item.slug,
    },
    {
      key: "authors",
      header: "Autoren",
      render: (item) => item.authors.join(", "),
    },
    {
      key: "publishedAt",
      header: "Veröffentlicht am",
      render: (item) => new Date(item.publishedAt).toLocaleDateString(),
    },
  ]);

  function openCreateModal() {
    editingBlog = null;
    formData = { title: {}, content: {}, slug: "", authors: [], coverImageKey: "" };
    modalLanguage = "de";
    showModal = true;
  }

  function openEditModal(blog) {
    editingBlog = blog;

    loadBlogTranslations(blog.id).then((fullTranslations) => {
      if (fullTranslations) {
        formData = {
          title: fullTranslations.title,
          content: fullTranslations.content,
          slug: fullTranslations.slug,
          authors: fullTranslations.authors,
          coverImageKey: fullTranslations.coverImageKey,
        };
      } else {
        formData = {
          title: { ...blog.title },
          content: { ...blog.content },
          slug: blog.slug,
          authors: [...blog.authors],
          coverImageKey: blog.coverImageKey,
        };
      }
      modalLanguage = "de";
      showModal = true;
    });
  }

  function closeModal() {
    showModal = false;
    editingBlog = null;
  }

  async function saveBlog(e) {
    e.preventDefault();

    try {
      loading = true;
      error = null;

      const authToken = getAuthToken();

      const cleanedTitle = {};
      const cleanedContent = {};

      for (const [lang, value] of Object.entries(formData.title)) {
        if (value && value.trim()) {
          cleanedTitle[lang] = value.trim();
        }
      }

      for (const [lang, value] of Object.entries(formData.content)) {
        if (value && value.trim()) {
          cleanedContent[lang] = value.trim();
        }
      }

      const blogData = {
        title: cleanedTitle,
        content: cleanedContent,
        slug: formData.slug,
        authors: formData.authors.filter((author) => author.trim()),
        coverImageKey: formData.coverImageKey || undefined,
      };

      if (editingBlog) {
        await trpcAuthQuery("blog.update", authToken, {
          id: editingBlog.id,
          ...blogData,
        });
        console.log("Blog updated:", blogData);
      } else {
        await trpcAuthQuery("blog.create", authToken, blogData);
      }

      await loadBlogs();
      closeModal();
    } catch (err) {
      console.error("Failed to save blog:", err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function deleteBlog(id) {
    if (confirm("Sind Sie sicher, dass Sie diesen Blogbeitrag löschen möchten?")) {
      try {
        loading = true;
        error = null;

        const authToken = getAuthToken();
        await trpcAuthQuery("blog.delete", authToken, id);

        await loadBlogs();
      } catch (err) {
        console.error("Failed to delete blog:", err);
        error = err.message;
      } finally {
        loading = false;
      }
    }
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Blogs Verwaltung</h1>
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
        {showModal ? "Speichere..." : "Lade Blogs..."}
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
              loadBlogs();
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
      title="Blogs Verwaltung"
      {columns}
      data={blogs}
      onCreate={openCreateModal}
      onEdit={openEditModal}
      onDelete={deleteBlog}
      createButtonText="Neuen Blogbeitrag hinzufügen"
      emptyStateTitle="Keine Blogbeiträge vorhanden"
      emptyStateDescription="Erstellen Sie Ihren ersten Blogbeitrag, um zu beginnen."
    />
  {/if}
</div>

<LanguageModal
  show={showModal}
  title={editingBlog ? "Blogbeitrag bearbeiten" : "Neuen Blogbeitrag erstellen"}
  {languages}
  currentLanguage={modalLanguage}
  onLanguageChange={(lang) => (modalLanguage = lang)}
  onClose={closeModal}
  onSubmit={saveBlog}
  submitText={editingBlog ? "Aktualisieren" : "Erstellen"}
>
  {#snippet children()}
    <div>
      <label for="title" class="block text-sm font-medium mb-1">
        Titel ({languages.find((l) => l.code === modalLanguage)?.name})
        {#if modalLanguage === "de"}
          <span aria-label="Pflichtfeld">*</span>
        {/if}
      </label>
      <input
        id="title"
        type="text"
        bind:value={formData.title[modalLanguage]}
        required={modalLanguage === "de"}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Blogtitel"
      />
      {#if modalLanguage !== "de"}
        <p class="mt-1 text-xs text-muted-foreground">Optional - falls leer, wird die deutsche Version verwendet</p>
      {/if}
    </div>

    <div>
      <label for="content" class="block text-sm font-medium mb-1">
        Inhalt ({languages.find((l) => l.code === modalLanguage)?.name})
        {#if modalLanguage === "de"}
          <span aria-label="Pflichtfeld">*</span>
        {/if}
      </label>
      <textarea
        id="content"
        bind:value={formData.content[modalLanguage]}
        rows="6"
        required={modalLanguage === "de"}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        placeholder="Bloginhalt"
      ></textarea>
      {#if modalLanguage !== "de"}
        <p class="mt-1 text-xs text-muted-foreground">Optional - falls leer, wird die deutsche Version verwendet</p>
      {/if}
    </div>

    <div>
      <label for="slug" class="block text-sm font-medium mb-1">
        Slug <span aria-label="Pflichtfeld">*</span>
      </label>
      <input
        id="slug"
        type="text"
        bind:value={formData.slug}
        required
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="blog-titel"
      />
      <p class="mt-1 text-xs text-muted-foreground">
        URL-freundliche Version des Titels (keine Leerzeichen, Sonderzeichen etc.)
      </p>
    </div>

    <div>
      <label for="authors" class="block text-sm font-medium mb-1">
        Autoren <span aria-label="Pflichtfeld">*</span>
      </label>
      <input
        id="authors"
        type="text"
        value={formData.authors.join(", ")}
        oninput={(e) => {
          formData.authors = e.target.value
            .split(",")
            .map((author) => author.trim())
            .filter(Boolean);
        }}
        required
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Autor 1, Autor 2"
      />
      <p class="mt-1 text-xs text-muted-foreground">Kommagetrennte Liste von Autoren</p>
    </div>

    <div>
      <label for="coverImageKey" class="block text-sm font-medium mb-1"> Cover-Bild (optional) </label>
      <input
        id="coverImageKey"
        type="text"
        bind:value={formData.coverImageKey}
        class="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Dateischlüssel des Bildes"
      />
    </div>
  {/snippet}
</LanguageModal>
