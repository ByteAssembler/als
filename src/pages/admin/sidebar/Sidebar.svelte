<script lang="ts">
  import SidebarNavSection from "./SidebarNavSection.svelte";
  import type { NavLinkData as NavSectionLinkData } from "./SidebarNavSection.svelte";
  import { createEventDispatcher } from "svelte";
  import "../styles.css";

  type SectionLink = {
    id: string;
    label: string;
    iconSvg: string;
    href?: string; // Optional, can be derived or used for actual navigation
  };

  type Section = {
    title: string;
    links: SectionLink[];
  };

  type Props = {
    sections: Section[];
    activeItemId: string;
    class?: string;
  };

  let { sections, activeItemId, class: className }: Props = $props();

  const dispatch = createEventDispatcher<{ select: { id: string } }>();

  function handleLinkClick(event: CustomEvent<{ id: string }>) {
    dispatch("select", { id: event.detail.id });
  }

  const processedSections = $derived(
    sections.map((section) => ({
      ...section,
      links: section.links.map(
        (link): NavSectionLinkData => ({
          ...link,
          href: link.href || `#${link.id}`, // Default href if not provided
          state: link.id === activeItemId ? "active" : "default",
        })
      ),
    }))
  );

  // Example: Keep existing discoverLinks and libraryLinks if they are static and separate
  // Or integrate them into the `sections` prop from AdminPanel.svelte for full configurability.
  // For this example, we'll assume they might still be here or managed by `sections`.
  // If they are to be dynamic and selectable like the main items, they should be part of `sections`.

  const discoverLinks: NavSectionLinkData[] = [
    {
      id: "listen-now", // Ensure unique IDs
      label: "Listen Now",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`,
      state: "listen-now" === activeItemId ? "active" : "default",
      href: "#listen-now",
    },
    {
      id: "browse",
      label: "Browse",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`,
      state: "browse" === activeItemId ? "active" : "default",
      href: "#browse",
    },
    {
      id: "radio",
      label: "Radio",
      iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xl:mr-2 lg:mr-0 size-4"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>`,
      state: "radio" === activeItemId ? "active" : "default",
      href: "#radio",
    },
  ];
  // Similar mapping for libraryLinks if they need to be dynamic based on activeItemId
</script>

<div
  class="fixed inset-y-0 left-0 z-40 xl:w-64 lg:w-16 md:w-16 w-0 bg-background border-r xl:block lg:block md:block hidden transition-all duration-300 {className}"
>
  <div class="space-y-4 py-4">
    {#each processedSections as section (section.title)}
      <SidebarNavSection title={section.title} links={section.links} on:linkClick={handleLinkClick} />
    {/each}
    <!-- Example of keeping static sections if needed, or integrate them into `processedSections` -->
    <!-- <SidebarNavSection title="Discover" links={discoverLinks} on:linkClick={handleLinkClick} /> -->
    <!-- <SidebarNavSection title="Library" links={libraryLinks} on:linkClick={handleLinkClick} /> -->
  </div>
</div>
