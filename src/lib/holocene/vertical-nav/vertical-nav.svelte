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
  let hoverBackgroundElement = $state<HTMLElement>();
  let activeBackgroundElement = $state<HTMLElement>();
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (activeItemId !== null) {
      activeItem.set(activeItemId);
    }
  });

  // Handle active item background (static)
  $effect(() => {
    if (activeBackgroundElement && navElement && $activeItem) {
      const element = itemElements.get($activeItem);
      if (element) {
        const navRect = navElement.getBoundingClientRect();
        const itemRect = element.getBoundingClientRect();
        const top = itemRect.top - navRect.top;
        const height = itemRect.height;

        activeBackgroundElement.style.transform = `translateY(${top}px)`;
        activeBackgroundElement.style.height = `${height}px`;
        activeBackgroundElement.style.opacity = '1';
      }
    } else if (activeBackgroundElement) {
      activeBackgroundElement.style.opacity = '0';
    }
  });

  // Handle hover background (animated) - only show if not hovering the active item
  $effect(() => {
    if (
      hoverBackgroundElement &&
      navElement &&
      $hoveredItem &&
      $hoveredItem !== $activeItem
    ) {
      const element = itemElements.get($hoveredItem);
      if (element) {
        const navRect = navElement.getBoundingClientRect();
        const itemRect = element.getBoundingClientRect();
        const top = itemRect.top - navRect.top;
        const height = itemRect.height;

        hoverBackgroundElement.style.transform = `translateY(${top}px)`;
        hoverBackgroundElement.style.height = `${height}px`;
        hoverBackgroundElement.style.opacity = '1';
      }
    } else if (hoverBackgroundElement) {
      hoverBackgroundElement.style.opacity = '0';
    }
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
    },
    setHoveredItem: (id: string | null) => {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }

      if (id !== null) {
        // Immediate hover when entering an item
        hoveredItem.set(id);
      } else {
        // Debounce when leaving (prevents jumpy behavior)
        hoverTimeout = setTimeout(() => {
          hoveredItem.set(null);
          hoverTimeout = null;
        }, HOVER_EXIT_DELAY_MS);
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
    bind:this={activeBackgroundElement}
    class={`pointer-events-none absolute left-0 w-full rounded-md bg-interactive-secondary-active transition-all ${ACTIVE_TRANSITION_DURATION} opacity-0 ease-out`}
    aria-hidden="true"
  ></div>

  <!-- Hover background (animated) -->
  <div
    bind:this={hoverBackgroundElement}
    class={`pointer-events-none absolute left-0 w-full rounded-md bg-interactive-secondary-hover transition-all ${HOVER_TRANSITION_DURATION} opacity-0 ease-out`}
    aria-hidden="true"
  ></div>

  <ul class="relative z-10 m-0 flex list-none flex-col gap-0.5 p-0">
    {@render children()}
  </ul>
</nav>
