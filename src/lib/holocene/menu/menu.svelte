<script lang="ts">
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';
  import type { HTMLAttributes } from 'svelte/elements';

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
  {id}
  bind:this={menuElement}
  {...$$restProps}
>
  <slot />
</ul>

<style lang="postcss">
  .menu {
    @apply absolute z-50 mt-1 p-2 overflow-scroll max-h-[480px] min-w-full list-none rounded-lg border border-gray-900 bg-white text-primary shadow focus:outline-none focus-visible:outline focus-visible:outline-blue-700 focus-visible:-outline-offset-2;

    &.left {
      @apply left-0 origin-top-left;
    }

    &.right {
      @apply right-0 origin-top-right;
    }
  }
</style>
