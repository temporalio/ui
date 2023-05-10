<script lang="ts" context="module">
  import { clickOutside } from '$lib/holocene/outside-click';
  import { setContext } from 'svelte';
  import { type Writable, writable } from 'svelte/store';

  export const MENU_CONTEXT = 'menu-context';

  export type MenuContext = {
    toggleMenu: () => void;
    closeMenu: () => void;
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
  };
</script>

<script lang="ts">
  let menuContainer: HTMLDivElement;
  const open = writable(false);
  const keepOpen = writable(false);

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  };

  const closeMenu = () => ($open = false);
  const toggleMenu = () => ($open = !$open);

  setContext<MenuContext>(MENU_CONTEXT, {
    open,
    keepOpen,
    toggleMenu,
    closeMenu,
  });
</script>

<div
  bind:this={menuContainer}
  use:clickOutside
  on:click-outside={() => ($open = false)}
  class="relative inline-block {$$props.class}"
  on:keydown|stopPropagation={handleKeydown}
>
  <slot {open} />
</div>
