<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import { createEventDispatcher, setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';

  export const MENU_CONTEXT = 'menu-context';

  export type MenuContext = {
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
    menuElement: Writable<HTMLUListElement>;
    containerElement: Writable<HTMLDivElement>;
  };
</script>

<script lang="ts">
  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    open?: Writable<boolean>;
    class?: string;
  }

  let {
    class: className = '',
    open = writable(false),
    ...restProps
  }: $$Props = $props();

  const keepOpen = writable(false);
  const menuElement: Writable<HTMLUListElement> = writable(null);
  const containerElement: Writable<HTMLDivElement> = writable(null);
  const dispatch = createEventDispatcher<{ close: undefined }>();

  const closeMenu = () => {
    if ($open) {
      dispatch('close');
      $open = false;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };

  setContext<MenuContext>(MENU_CONTEXT, {
    open,
    keepOpen,
    menuElement,
    containerElement,
  });
</script>

<div
  use:clickoutside={closeMenu}
  class={merge('relative', className)}
  bind:this={$containerElement}
  onkeydown={handleKeydown}
  {...restProps}
>
  <slot {open} />
</div>
