<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { fly } from 'svelte/transition';

  import { getContext } from 'svelte';

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
</script>

<ul
  in:fly={{ duration: 100 }}
  role="menu"
  class="menu {position} {className}"
  class:hidden={!$open}
  aria-labelledby={id}
  tabindex={-1}
  {id}
  bind:this={menuElement}
  {...$$restProps}
>
  <slot />
</ul>

<style lang="postcss">
  .menu {
    @apply absolute z-20 mt-1 max-h-[480px] min-w-full list-none overflow-auto rounded-lg border border-gray-900 bg-white text-primary shadow;

    &.left {
      @apply left-0 origin-top-left;
    }

    &.right {
      @apply right-0 origin-top-right;
    }
  }
</style>
