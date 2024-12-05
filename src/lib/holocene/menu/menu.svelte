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
    position?: 'left' | 'right' | 'top-left' | 'top-right';
    menuElement?: HTMLUListElement;
    maxHeight?: string;
  }

  let className = '';
  let height = 0;
  export { className as class };
  export let id: string;
  export let keepOpen = false;
  export let position: 'left' | 'right' | 'top-left' | 'top-right' = 'left';
  export let menuElement: HTMLUListElement = null;
  export let maxHeight: string = 'max-h-[20rem]';

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
  class={merge('menu', maxHeight, position, className)}
  class:hidden={!$open}
  aria-labelledby={id}
  tabindex={-1}
  style={position === 'top-right' || position === 'top-left'
    ? `top: -${height + 16}px;`
    : ''}
  {id}
  bind:this={menuElement}
  bind:clientHeight={height}
  on:focusout={handleFocusOut}
  on:click|stopPropagation
  {...$$restProps}
>
  <slot />
</ul>

<style lang="postcss">
  .menu {
    @apply surface-primary absolute z-20 mt-1 min-w-fit list-none overflow-auto rounded-lg border border-subtle text-primary shadow;

    &.left,
    &.top-left {
      @apply left-0 origin-top-left;
    }

    &.right,
    &.top-right {
      @apply right-0 origin-top-right;
    }
  }
</style>
