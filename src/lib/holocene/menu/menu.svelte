<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { fly } from 'svelte/transition';

  import { getContext } from 'svelte';

  import { getFocusableElements } from '$lib/utilities/focus-trap';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  interface $$Props extends HTMLAttributes<HTMLUListElement> {
    id: string;
    keepOpen?: boolean;
    position?: 'left' | 'right';
    theme?: 'light' | 'dark';
    menuElement?: HTMLUListElement;
  }

  let className = '';
  export { className as class };
  export let id: string;
  export let keepOpen = false;
  export let position: 'left' | 'right' = 'left';
  export let theme: 'light' | 'dark' = 'light';
  export let menuElement: HTMLUListElement = null;

  const {
    keepOpen: keepOpenCtx,
    menuElement: menuElementCtx,
    open,
  } = getContext<MenuContext>(MENU_CONTEXT);

  $: $keepOpenCtx = keepOpen;
  $: $menuElementCtx = menuElement;

  $: menuItems = menuElement ? getFocusableElements(menuElement) : [];
  $: lastMenuItem = menuItems[menuItems.length - 1];

  const handleFocusOut = (e: FocusEvent) => {
    if (!$keepOpenCtx && e.target === lastMenuItem) $open = false;
  };
</script>

<ul
  in:fly={{ duration: 100 }}
  role="menu"
  class="menu {position} {theme} {className}"
  class:hidden={!$open}
  aria-labelledby={id}
  tabindex={-1}
  {id}
  bind:this={menuElement}
  on:focusout={handleFocusOut}
  {...$$restProps}
>
  <slot />
</ul>

<style lang="postcss">
  .menu {
    @apply absolute z-20 mt-1 max-h-[480px] min-w-full list-none overflow-auto rounded-lg border border-gray-900 bg-white text-primary shadow;

    &.light {
      @apply border-primary bg-white text-primary;
    }

    &.dark {
      @apply border-gray-400 bg-primary text-white;
    }

    &.left {
      @apply left-0 origin-top-left;
    }

    &.right {
      @apply right-0 origin-top-right;
    }
  }
</style>
