<script lang="ts" module>
  import type { Readable } from 'svelte/store';

  export type VerticalNavContext = {
    activeItem: Readable<string>;
    hoveredItem: Readable<string | null>;
    selectItem: (id: string) => void;
    setHoveredItem: (id: string | null) => void;
    registerItem: (id: string, element: HTMLElement) => void;
    unregisterItem: (id: string) => void;
    getItemPosition: (id: string) => { top: number; height: number } | null;
  };

  export const VERTICAL_NAV = {};

  // Animation constants
  const HOVER_EXIT_DELAY_MS = 100;
  const ACTIVE_TRANSITION_DURATION = 'duration-300';
  const HOVER_TRANSITION_DURATION = 'duration-200';
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { writable } from 'svelte/store';

  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLAttributes<HTMLElement> {
    'aria-label': string;
    activeItemId?: string;
    class?: string;
    children: Snippet;
  }

  let {
    'aria-label': ariaLabel,
    activeItemId = null,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const activeItem = writable<string>(activeItemId);
  const hoveredItem = writable<string | null>(null);
  const itemElements = new Map<string, HTMLElement>();

  let navElement = $state<HTMLElement>();
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
  let enableTransitions = $state(false);
  let hideHoverBackground = $state(false);

  // Sync activeItemId prop to internal store
  $effect.pre(() => {
    if (activeItemId !== null) {
      activeItem.set(activeItemId);
    }
  });

  // Calculate active item position and styles
  const activeBackgroundStyles = $derived.by(() => {
    if (!navElement || !$activeItem) {
      return { transform: '', height: '', opacity: '0' };
    }

    const element = itemElements.get($activeItem);
    if (!element) {
      return { transform: '', height: '', opacity: '0' };
    }

    const navRect = navElement.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const top = itemRect.top - navRect.top;
    const height = itemRect.height;

    return {
      transform: `translateY(${top}px)`,
      height: `${height}px`,
      opacity: '1',
    };
  });

  // Calculate hover item position and styles
  const hoverBackgroundStyles = $derived.by(() => {
    if (!navElement || !$hoveredItem || $hoveredItem === $activeItem) {
      return { transform: '', height: '', opacity: '0' };
    }

    const element = itemElements.get($hoveredItem);
    if (!element) {
      return { transform: '', height: '', opacity: '0' };
    }

    const navRect = navElement.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const top = itemRect.top - navRect.top;
    const height = itemRect.height;

    return {
      transform: `translateY(${top}px)`,
      height: `${height}px`,
      opacity: '1',
    };
  });

  $effect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  });

  setContext<VerticalNavContext>(VERTICAL_NAV, {
    activeItem,
    hoveredItem,
    selectItem: (id: string) => {
      activeItem.set(id);
      // Hide hover background completely after clicking
      hideHoverBackground = true;
      hoveredItem.set(null);
      enableTransitions = false;
    },
    setHoveredItem: (id: string | null) => {
      // Clear any existing hover timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }

      // Handle mouse leave
      if (id === null) {
        hoverTimeout = setTimeout(() => {
          hoveredItem.set(null);
          hoverTimeout = null;
          enableTransitions = false;
        }, HOVER_EXIT_DELAY_MS);
        return;
      }

      // Skip hover for active item
      if (id === $activeItem) {
        hoveredItem.set(null);
        enableTransitions = false;
        return;
      }

      // Check if this is first hover after click or no previous hover
      const isFirstHover = hideHoverBackground || !$hoveredItem;

      // Reset the hide flag
      if (hideHoverBackground) {
        hideHoverBackground = false;
      }

      // Set hovered item
      hoveredItem.set(id);

      // Don't enable transitions for first hover (appear, not animate)
      if (isFirstHover) {
        enableTransitions = false;
        return;
      }

      // Enable transitions for subsequent hovers
      if (!enableTransitions) {
        requestAnimationFrame(() => {
          enableTransitions = true;
        });
      }
    },
    registerItem: (id: string, element: HTMLElement) => {
      itemElements.set(id, element);
    },
    unregisterItem: (id: string) => {
      itemElements.delete(id);
    },
    getItemPosition: (id: string) => {
      const element = itemElements.get(id);
      if (!element || !navElement) return null;

      const navRect = navElement.getBoundingClientRect();
      const itemRect = element.getBoundingClientRect();
      return {
        top: itemRect.top - navRect.top,
        height: itemRect.height,
      };
    },
  });
</script>

<nav
  bind:this={navElement}
  class={merge('relative flex flex-col gap-1', className)}
  aria-label={ariaLabel}
  {...restProps}
>
  <!-- Active item background (static) -->
  <div
    style:transform={activeBackgroundStyles.transform}
    style:height={activeBackgroundStyles.height}
    style:opacity={activeBackgroundStyles.opacity}
    class={`pointer-events-none absolute left-0 w-full rounded-md bg-interactive-secondary-active transition-all ${ACTIVE_TRANSITION_DURATION} ease-out`}
    aria-hidden="true"
  ></div>

  <!-- Hover background (animated) -->
  {#if !hideHoverBackground && $hoveredItem && $hoveredItem !== $activeItem}
    <div
      style:transform={hoverBackgroundStyles.transform}
      style:height={hoverBackgroundStyles.height}
      style:opacity={hoverBackgroundStyles.opacity}
      class={`pointer-events-none absolute left-0 w-full rounded-md bg-interactive-secondary-hover ${
        enableTransitions
          ? `transition-all ${HOVER_TRANSITION_DURATION} ease-out`
          : ''
      }`}
      aria-hidden="true"
    ></div>
  {/if}

  <ul class="relative z-10 m-0 flex list-none flex-col gap-0.5 p-0">
    {@render children()}
  </ul>
</nav>
