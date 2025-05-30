<script>
  import { onMount } from "svelte";
  import FileManager from "./schema/FileManager.svelte";
  import Navbar from "./schema/Navbar.svelte";
  import Links from "./schema/Links.svelte";
  import Blogs from "./schema/Blogs.svelte";
  import Celebrities from "./schema/Celebrities.svelte";
  import Map from "./schema/Map.svelte";
  import "./styles.css";
  import Sidebar from "./sidebar/Sidebar.svelte";

  let activeItemId = $state("dashboard");

  const sidebarSections = $state([
    {
      title: "Main",
      links: [
        {
          id: "dashboard",
          label: "Dashboard",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>`,
        },
        {
          id: "file-manager",
          label: "File Manager",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
        },
        {
          id: "links",
          label: "Links",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
        },
        /*
		{
          id: "navbar",
          label: "Navigation",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M3 21h18"></path></svg>`,
        },
		*/
        {
          id: "users",
          label: "Users",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        },
        {
          id: "blogs",
          label: "Blogs",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>`,
        },
        {
          id: "map",
          label: "Map",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>`,
        },
        {
          id: "celebrities",
          label: "Celebrities",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
        },
      ],
    },
  ]);

  const currentLabel = $derived(
    sidebarSections.flatMap((section) => section.links).find((item) => item.id === activeItemId)?.label || "Dashboard"
  );

  // Handle section changes with history
  function changeSection(sectionId) {
    if (sectionId !== activeItemId) {
      activeItemId = sectionId;
      // Update browser history
      const url = new URL(window.location);
      url.searchParams.set("section", sectionId);
      window.history.pushState({ section: sectionId }, "", url);
    }
  }

  // Handle browser back/forward buttons
  function handlePopState(event) {
    const section = event.state?.section || new URLSearchParams(window.location.search).get("section") || "dashboard";
    activeItemId = section;
  }

  onMount(() => {
    // Initialize from URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const sectionFromUrl = urlParams.get("section");
    if (sectionFromUrl) {
      activeItemId = sectionFromUrl;
    }

    // Listen for browser back/forward
    window.addEventListener("popstate", handlePopState);

    // Set initial history state
    const url = new URL(window.location);
    url.searchParams.set("section", activeItemId);
    window.history.replaceState({ section: activeItemId }, "", url);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  });
</script>

<div class="min-h-screen bg-background">
  <!-- Sidebar -->
  <Sidebar sections={sidebarSections} {activeItemId} on:select={(event) => changeSection(event.detail.id)} />

  <!-- Main Content -->
  <main class="xl:pl-64 lg:pl-16 md:pl-16 pl-0 min-h-screen transition-all duration-300">
    <div class="px-6 py-8 lg:px-8">
      {#if activeItemId === undefined || activeItemId === null || activeItemId === "dashboard"}
        <!-- List of Sections -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">Select a Section</h2>
          <ul class="list-none space-y-4">
            {#each sidebarSections
              .flatMap((section) => section.links)
              .filter((item) => item.id !== "dashboard") as item}
              <li>
                <button
                  class="flex items-center space-x-4 px-6 py-4 rounded-lg bg-card hover:bg-muted transition-colors w-full text-left border text-lg"
                  onclick={() => changeSection(item.id)}
                >
                  {@html item.iconSvg}
                  <span>{item.label}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {:else if activeItemId === "map"}
        <Map />
      {:else if activeItemId === "celebrities"}
        <Celebrities />
      {:else if activeItemId === "language-settings"}
        <LanguageSettings />
      {:else if activeItemId === "links"}
        <Links />
      {:else if activeItemId === "file-manager"}
        <FileManager />
      {:else if activeItemId === "navbar"}
        <Navbar />
      {:else if activeItemId === "blogs"}
        <Blogs />
      {:else if activeItemId === "dashboard"}
        <!-- Dashboard Content -->
        <div class="space-y-6">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <!-- ...existing dashboard stats cards... -->
          </div>

          <!-- Chart Placeholder -->
          <div class="bg-card shadow-sm rounded-lg border">
            <div class="px-6 py-5 border-b">
              <h3 class="text-lg leading-6 font-medium">Analytics Overview</h3>
            </div>
            <div class="p-6">
              <div class="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div class="text-center">
                  <svg
                    class="mx-auto h-12 w-12 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                  <p class="mt-2 text-sm text-muted-foreground">Chart visualization will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- Other Sections - Empty State -->
        <div class="bg-card shadow-sm rounded-lg border">
          <div class="px-6 py-12">
            <div class="text-center">
              <svg
                class="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
              <h3 class="mt-4 text-lg font-medium">
                {currentLabel} Settings
              </h3>
              <p class="mt-2 text-sm text-muted-foreground">
                This section is currently empty. Settings and options will be implemented here.
              </p>
              <div class="mt-6">
                <button
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                >
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Add Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>
