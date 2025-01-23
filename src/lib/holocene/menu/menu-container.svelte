<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';

  import { setContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';

  export const MENU_CONTEXT = 'menu-context';

  export type MenuContext = {
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
    menuElement: Writable<HTMLUListElement>;
  };
</script>

<script lang="ts">
  interface Props {
    open?: Writable<boolean>;
    class?: string;
    close?: () => void;
    children?: Snippet<[{ open: Writable<boolean> }]>;
  }

  let {
    open = writable(false),
    class: className = '',
    close = () => {},
    children,
    ...rest
  }: Props = $props();

  const keepOpen = writable(false);
  const menuElement: Writable<HTMLUListElement> = writable(null);

  const closeMenu = () => {
    if ($open) {
      close();
      $open = false;
    }
  };

  setContext<MenuContext>(MENU_CONTEXT, {
    open,
    keepOpen,
    menuElement,
  });
</script>

<div
  use:clickoutside={closeMenu}
  class={merge('relative', className)}
  {...rest}
>
  {@render children?.({ open })}
</div>
