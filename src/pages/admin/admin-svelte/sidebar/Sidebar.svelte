<script lang="ts">
  import SidebarNavSection, { type NavLinkData } from "./SidebarNavSection.svelte";
  import { type ScrollableNavLinkData } from "./SidebarScrollableNavSection.svelte";
  import "../styles.css";

  type Props = {
    class?: string;
  };
  let { class: className }: Props = $props();

  // Data for the sidebar sections
  // In a real application, this data might come from props, a store, or an API call.
  const discoverLinks: NavLinkData[] = [
    {
      label: "Listen Now",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`,
      state: "active",
    },
    {
      label: "Browse",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`,
      state: "default",
    },
    {
      label: "Radio",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>`,
      state: "default",
    },
  ];

  const libraryLinks: NavLinkData[] = [
    {
      label: "Playlists",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M21 15V6"></path><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M12 12H3"></path><path d="M16 6H3"></path><path d="M12 18H3"></path></svg>`,
      state: "default",
    },
    {
      label: "Songs",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><circle cx="8" cy="18" r="4"></circle><path d="M12 18V2l7 4"></path></svg>`,
      state: "default",
    },
    {
      label: "Made for You",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      state: "default",
    },
    {
      label: "Artists",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path><circle cx="17" cy="7" r="5"></circle></svg>`,
      state: "default",
    },
    {
      label: "Albums",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path></svg>`,
      state: "default",
    },
  ];

  const playlistIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M21 15V6"></path><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M12 12H3"></path><path d="M16 6H3"></path><path d="M12 18H3"></path></svg>`;
  const playlistItems: ScrollableNavLinkData[] = [
    { label: "Recently Added", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Recently Played", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Top Songs", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Top Albums", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Top Artists", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Logic Discography", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Bedtime Beats", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Feeling Happy", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "I miss Y2K Pop", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Runtober", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Mellow Days", iconSvg: playlistIconSvg, state: "ghost" },
    { label: "Eminem Essentials", iconSvg: playlistIconSvg, state: "ghost" },
  ];
</script>

<div
  class="fixed inset-y-0 left-0 z-40 xl:w-64 lg:w-16 md:w-16 w-0 bg-background border-r xl:block lg:block md:block hidden transition-all duration-300"
>
  <div class="space-y-4 py-4">
    <SidebarNavSection title="Discover" links={discoverLinks} />
    <SidebarNavSection title="Library" links={libraryLinks} />
  </div>
</div>
