<script lang="ts" context="module">
  import { setContext, createEventDispatcher } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { type Writable, writable } from 'svelte/store';
  import { clickOutside } from '$lib/holocene/outside-click';

  export const MENU_CONTEXT = 'menu-context';

  export type MenuContext = {
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
    menuElement: Writable<HTMLUListElement>;
  };
</script>

<script lang="ts">
  interface $$Props extends HTMLAttributes<HTMLUListElement> {
    open?: Writable<boolean>;
    class?: string;
  }

  let className = '';
  export { className as class };
  export let open: Writable<boolean> = writable(false);

  const keepOpen = writable(false);
  const menuElement: Writable<HTMLUListElement> = writable(null);
  const dispatch = createEventDispatcher<{ close: undefined }>();

  const closeMenu = () => {
    dispatch('close');
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
  class="relative {className}"
  {...$$restProps}
>
  <slot {open} />
</div>
