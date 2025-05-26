<script>
  import Sidebar from "./sidebar/Sidebar.svelte";

  let activeSection = "dashboard";
  import "./styles.css";

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
    { id: "security", label: "Security" },
  ];
</script>

<div class="min-h-screen bg-background">
  <!-- Sidebar -->
  <Sidebar />

  <!-- Main Content -->
  <main class="xl:pl-64 lg:pl-16 md:pl-16 pl-0 min-h-screen transition-all duration-300">
    <!-- Header -->
    <header class="bg-background border-b px-6 py-4 lg:px-8">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold leading-7 sm:truncate">
            {navItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
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
      {#if activeSection === "dashboard"}
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
                {navItems.find((item) => item.id === activeSection)?.label} Settings
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
