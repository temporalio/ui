<script lang="ts" context="module">
  import { clickOutside } from '$lib/holocene/outside-click';
  import { setContext } from 'svelte';
  import { type Writable, writable } from 'svelte/store';

  export const MENU_CONTEXT = 'menu-context';

  export type MenuContext = {
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
    menuElement: Writable<HTMLUListElement>;
  };
</script>

<script lang="ts">
  export let open: Writable<boolean> = writable(false);

  const keepOpen = writable(false);
  const menuElement: Writable<HTMLUListElement> = writable(null);

  const closeMenu = () => {
    $open = false;
  };

  setContext<MenuContext>(MENU_CONTEXT, {
    open,
    keepOpen,
    menuElement,
  });
</script>

<div
  use:clickOutside
  on:click-outside={closeMenu}
  class="relative {$$props.class}"
>
  <slot {open} />
</div>
