<script lang="ts" module>
  export const MENU_CONTEXT = 'menu-context';

  export type MenuContext = {
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
    menuElement: Writable<HTMLUListElement>;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import { setContext, type Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';

  interface Props
    extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    open?: Writable<boolean>;
    class?: ClassNameValue;
    onclose?: () => void;
    children: Snippet<[boolean]>;
  }

  const {
    open = writable(false),
    class: className,
    children,
    onclose,
    ...rest
  }: Props = $props();

  const keepOpen = writable(false);
  const menuElement: Writable<HTMLUListElement> = writable(null);

  const closeMenu = () => {
    if ($open) {
      onclose?.();
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
  {@render children($open)}
</div>
