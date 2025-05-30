<script>
  import FileUplaod from "./schema/FileUplaod.svelte";
  import Media from "./schema/Media.svelte";
  import Navbar from "./schema/Navbar.svelte";
  import Links from "./schema/Links.svelte";
  import Sidebar from "./sidebar/Sidebar.svelte";
  import Blogs from "./schema/Blogs.svelte";
  import Celebrities from "./schema/Celebrities.svelte";
  import Map from "./schema/Map.svelte";
  import LanguageSettings from "./schema/LanguageSettings.svelte";
  import "./styles.css";

  let activeItemId = $state("dashboard");

  const sidebarSections = $state([
    {
      title: "Main",
      links: [
        {
          id: "dashboard",
          label: "Dashboard",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>`,
        },
        {
          id: "links",
          label: "Links",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M10 13a5 5 0 1 1 7.07-7.07l-1.41 1.41a3 3 0 1 0-4.24 4.24l1.41 1.41A5 5 0 0 1 10 13z"></path><path d="M14.83 14.83a5 5 0 1 1-7.07-7.07l1.41-1.41a3 3 0 1 0-4.24-4.24l-1.41-1.41A5 5 0 0 1 9.17 9.17l1.41-1.41a3 3 0 1 0-4.24-4.24l1.41-1.41A5 5 0 0 1 14.83 14.83z"></path></svg>`,
        },
        {
          id: "navbar",
          label: "Navigation",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M3 21h18"></path></svg>`,
        },
        {
          id: "file-upload",
          label: "File Upload",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="M12.5 16h-1a2.5 2.5 0 0 0-2.5 2.5v1a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 12.5 16z"></path><path d="M12.5 8V6a4.5 4.5 0 1 1-4.5-4.5"></path></svg>`,
        },
        {
          id: "media",
          label: "Media",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M21 16V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><circle cx="12" cy="10" r="4"></circle><path d="M16.24 16.24A4.5 4.5 0 1 1 19.5 19.5"></path></svg>`,
        },
        {
          id: "users",
          label: "Users",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        },
        {
          id: "blogs",
          label: "Blogs",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path><path d="M3.5 8h17"></path><path d="M3.5 12h17"></path><path d="M3.5 16h17"></path></svg>`,
        },
        {
          id: "map",
          label: "map",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M3 3v18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path><path d="M16.5 6.5l1.5-1.5"></path><path d="M19.5 9.5l1.5-1.5"></path><path d="M16.5 12.5l1.5-1.5"></path></svg>`,
        },
        {
          id: "celebrities",
          label: "Celebrities",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="M12 8a4 4 0 1 1-4 4"></path><path d="M12.5 16h-1a2.5 2.5 0 0 0-2.5 2.5v1a2.5 2.5 0 0 0 2.5 2.5h1a2.5 2.5 0 0 0 2.5-2.5v-1A2.5 2.5 0 0 0 12.5 16z"></path></svg>`,
        },
        {
          id: "language-settings",
          label: "Sprachen",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M5 8l6 6"></path><path d="M4 14l6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="M22 22l-5-10-5 10"></path><path d="M14 18h6"></path></svg>`,
        },
      ],
    },
    // ... other sections like "Discover", "Library" can be added here in the same format
  ]);

  const currentLabel = $derived(
    sidebarSections.flatMap((section) => section.links).find((item) => item.id === activeItemId)?.label || "Dashboard"
  );
</script>

<div class="min-h-screen bg-background">
  <!-- Sidebar -->
  <Sidebar sections={sidebarSections} {activeItemId} on:select={(event) => (activeItemId = event.detail.id)} />

  <!-- button back home -->
  <!-- Main Content -->
  <main class="xl:pl-64 lg:pl-16 md:pl-16 pl-0 min-h-screen transition-all duration-300">
    <!-- Content Area -->
    <div class="px-6 py-8 lg:px-8">
      {#if activeItemId === "language-settings"}
        <LanguageSettings />
      {:else if activeItemId === "links"}
        <Links />
      {:else if activeItemId === "navbar"}
        <Navbar />
      {:else if activeItemId === "blogs"}
        <Blogs />
      {:else if activeItemId === "map"}
        <Map />
      {:else if activeItemId === "celebrities"}
        <Celebrities />
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
