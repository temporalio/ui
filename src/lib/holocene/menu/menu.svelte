<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { fly } from 'svelte/transition';

  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { getFocusableElements } from '$lib/utilities/focus-trap';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  interface $$Props extends HTMLAttributes<HTMLUListElement> {
    id: string;
    keepOpen?: boolean;
    position?: 'left' | 'right';
    menuElement?: HTMLUListElement;
  }

  let className = '';
  export { className as class };
  export let id: string;
  export let keepOpen = false;
  export let position: 'left' | 'right' = 'left';
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
  class={merge(['menu', 'max-h-[320px]'], position, className)}
  class:hidden={!$open}
  aria-labelledby={id}
  tabindex={-1}
  {id}
  bind:this={menuElement}
  on:focusout={handleFocusOut}
  on:click|stopPropagation
  {...$$restProps}
>
  <slot />
</ul>

<style lang="postcss">
  .menu {
    @apply surface-primary absolute z-20 mt-1 min-w-full list-none overflow-auto rounded-lg border-2 border-subtle text-primary shadow;

    &.left {
      @apply left-0 origin-top-left;
    }

    &.right {
      @apply right-0 origin-top-right;
    }
  }
</style>
