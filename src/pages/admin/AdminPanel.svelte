<script>
  import Links from "./schmea/Links.svelte";
  import Sidebar from "./sidebar/Sidebar.svelte";
  import "./styles.css";

  let activeItemId = $state("dashboard");

  const sidebarSections = $state([
    {
      title: "Main",
      links: [
        {
          id: "links",
          label: "Links",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M10 13a5 5 0 1 1 7.07-7.07l-1.41 1.41a3 3 0 1 0-4.24 4.24l1.41 1.41A5 5 0 0 1 10 13z"></path><path d="M14.83 14.83a5 5 0 1 1-7.07-7.07l1.41-1.41a3 3 0 1 0-4.24-4.24l-1.41-1.41A5 5 0 0 1 9.17 9.17l1.41-1.41a3 3 0 1 0-4.24-4.24l1.41-1.41A5 5 0 0 1 14.83 14.83z"></path></svg>`,
        },
        {
          id: "dashboard",
          label: "Dashboard",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>`,
        },
        {
          id: "users",
          label: "Users",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
        },
        {
          id: "analytics",
          label: "Analytics",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>`,
        },
        {
          id: "settings",
          label: "Settings",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
        },
        {
          id: "security",
          label: "Security",
          iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><shield_def><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></shield_def></svg>`,
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

  <!-- Main Content -->
  <main class="xl:pl-64 lg:pl-16 md:pl-16 pl-0 min-h-screen transition-all duration-300">
    <!-- Header -->
    <header class="bg-background border-b px-6 py-4 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold leading-7 sm:truncate">
            {currentLabel}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">Manage your application settings and preferences</p>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative hidden sm:block">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search..."
              class="block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring sm:text-sm"
            />
          </div>

          <!-- Notifications -->
          <button class="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-3.5-3.5a12.1 12.1 0 01-.5-8.5L15 6l-1 1-1-1-1 1V5a2 2 0 114 0v1l-1 1 1 1-1.5 1.5a12.1 12.1 0 01-.5 8.5L15 17z"
              ></path>
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
        </div>
      </div>
    </header>

    <!-- Content Area -->
    <div class="px-6 py-8 lg:px-8">
      {#if activeItemId === "links"}
        <Links />
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
