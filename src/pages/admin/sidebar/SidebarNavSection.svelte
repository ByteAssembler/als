<script lang="ts">
  import { cn } from "@/../utils/utils";
  import SidebarLink, { type LinkState } from "./SidebarLink.svelte";
  import { createEventDispatcher } from "svelte";

  export type NavLinkData = {
    id: string; // Ensure id is part of the type
    label: string;
    iconSvg: string; // Full SVG string
    href?: string;
    state?: LinkState; // 'active', 'default', or 'ghost'
  };

  type Props = {
    title: string;
    links: NavLinkData[];
    class?: string;
  };
  let { title, links, class: className }: Props = $props();

  const dispatch = createEventDispatcher<{ linkClick: { id: string } }>();

  function handleLinkClick(event: CustomEvent<{ id: string }>) {
    dispatch("linkClick", { id: event.detail.id });
  }
</script>

<div class={cn("px-3 py-2", className)}>
  <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight xl:block md:hidden">{title}</h2>
  <div class="space-y-1">
    {#each links as linkItem (linkItem.id)}
      <SidebarLink id={linkItem.id} href={linkItem.href} state={linkItem.state ?? "default"} on:click={handleLinkClick}>
        {#snippet children()}
          {@html linkItem.iconSvg}
          <span class="xl:inline md:hidden">{linkItem.label}</span>
        {/snippet}
      </SidebarLink>
    {/each}
  </div>
</div>
