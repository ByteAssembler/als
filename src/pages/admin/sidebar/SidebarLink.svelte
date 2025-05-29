<script lang="ts" module>
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { tv, type VariantProps } from "tailwind-variants";
  import type { Snippet } from "svelte";

  export const sidebarLinkVariants = tv({
    base: "inline-flex h-9 w-full items-center xl:justify-start md:justify-center xl:gap-2 md:gap-0 whitespace-nowrap rounded-md xl:px-4 md:px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variants: {
      state: {
        active: "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 font-medium",
        // Active state with a shadow and specific background
        default: "hover:bg-accent hover:text-accent-foreground font-medium",
        ghost: "hover:bg-accent hover:text-accent-foreground font-normal",
      },
    },
    defaultVariants: {
      state: "default",
    },
  });

  export type LinkState = VariantProps<typeof sidebarLinkVariants>["state"];

  // Common properties for the component's specific logic and styling
  type ComponentBaseProps = {
    id: string; // Added id prop
    state?: LinkState;
    children: Snippet;
    class?: string; // For consumers to pass additional classes
    ref?: any; // For bind:this
  };

  // Props for when the component is an anchor
  type AnchorElementProps = Omit<HTMLAnchorAttributes, keyof ComponentBaseProps | "type"> & {
    href: string; // Discriminant property
    type?: never; // Ensure button's type is not applicable here
  };

  // Props for when the component is a button
  type ButtonElementProps = Omit<HTMLButtonAttributes, keyof ComponentBaseProps | "href"> & {
    href?: never; // Ensure anchor's href is not applicable here
    // `type` for button is part of HTMLButtonAttributes (e.g., "button", "submit", "reset")
  };

  export type Props = ComponentBaseProps & (AnchorElementProps | ButtonElementProps);
</script>

<script lang="ts">
  import type { Props as ComponentProps } from "./SidebarLink.svelte"; // Import from module
  import { cn } from "../../../utils/utils";
  import { createEventDispatcher } from "svelte";

  let {
    id, // Added id prop
    class: className,
    children,
    state = "default",
    href, // This will be string | undefined based on Props
    type, // This will be HTMLButtonAttributes['type'] | undefined
    ref = $bindable(null),
    ...restAttributes // Contains other valid HTML attributes for <a> or <button>
  }: ComponentProps = $props();

  const dispatch = createEventDispatcher<{ click: { id: string } }>();

  // Determine the button's type attribute, defaulting to "button"
  // This is only relevant if it's not an anchor
  const buttonElementType = href ? undefined : type || "button";

  function handleClick() {
    dispatch("click", { id: id });
  }
</script>

{#if href}
  <a
    bind:this={ref}
    class={cn(sidebarLinkVariants({ state }), className)}
    {href}
    on:click|preventDefault={handleClick}
    {...restAttributes as any}
  >
    {@render children()}
  </a>
{:else}
  <button
    bind:this={ref}
    class={cn(sidebarLinkVariants({ state }), className)}
    type={buttonElementType}
    on:click={handleClick}
    {...restAttributes as any}
  >
    {@render children()}
  </button>
{/if}
