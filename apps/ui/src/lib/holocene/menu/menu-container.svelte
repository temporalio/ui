<script lang="ts" module>
  import type { ButtonSize } from '$lib/holocene/button.svelte';

  export const MENU_CONTEXT = 'menu-context';

  export const FALLBACK_MENU_SIZE: ButtonSize = 'sm';

  export type MenuContext = {
    open: Writable<boolean>;
    keepOpen: Writable<boolean>;
    menuElement: Writable<HTMLUListElement | null>;
    size?: Writable<ButtonSize>;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import { setContext, type Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { clickoutside } from '$lib/holocene/outside-click';

  interface Props extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children'
  > {
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
  const menuElement: Writable<HTMLUListElement | null> = writable(null);
  const size: Writable<ButtonSize> = writable(FALLBACK_MENU_SIZE);

  const closeMenu = (event?: MouseEvent) => {
    if (event?.target instanceof Node && $menuElement?.contains(event.target))
      return;

    if ($open) {
      onclose?.();
      $open = false;
    }
  };

  setContext<MenuContext>(MENU_CONTEXT, {
    open: open,
    keepOpen: keepOpen,
    menuElement: menuElement,
    size,
  });
</script>

<div
  use:clickoutside={closeMenu}
  class={merge('relative', className)}
  {...rest}
>
  {@render children($open)}
</div>
