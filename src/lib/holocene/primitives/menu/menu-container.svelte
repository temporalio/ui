<script lang="ts" context="module">
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

  const handleWindowClick = (event: MouseEvent) => {
    if (!menuContainer.contains(event.target as Node)) {
      closeMenu();
    }
  };

  const handleWindowKeydown = (event: KeyboardEvent) => {
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

<svelte:window
  on:click|stopPropagation={handleWindowClick}
  on:keydown|stopPropagation={handleWindowKeydown}
/>

<div
  bind:this={menuContainer}
  class="relative inline-block {$$props.class}"
  on:click={handleWindowClick}
  on:keydown|stopPropagation={handleWindowKeydown}
>
  <slot />
</div>
