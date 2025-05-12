<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { v4 } from 'uuid';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  type Props = HTMLAttributes<HTMLDivElement> & {
    id?: string;
    icon?: IconName;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    onToggle?: () => Promise<void>;
    'data-testid'?: string;
    title?: string;
    description?: Snippet;
    action?: Snippet;
    children?: Snippet<[open: boolean]>;
  };

  let {
    id = v4(),
    icon = undefined,
    open = false,
    onToggle = undefined,
    title,
    description,
    action,
    children,
    ...restProps
  }: Props = $props();

  const toggleAccordion = async () => {
    if (onToggle) {
      await onToggle();
      open = !open;
    } else {
      open = !open;
    }
  };
</script>

<div class="w-full {restProps.class}">
  <button
    id="{id}-trigger"
    aria-expanded={open}
    aria-controls="{id}-content"
    class="focus-visible:outline-interactive w-full cursor-pointer hover:bg-interactive-secondary-hover"
    type="button"
    onclick={toggleAccordion}
  >
    <div class="flex w-full flex-row items-center justify-between gap-2 pr-4">
      {title}
      {@render description?.()}
      <div class="flex items-center gap-4">
        {@render action?.()}
        <Icon name={icon ? icon : open ? 'arrow-down' : 'arrow-right'} />
      </div>
    </div>
  </button>
  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    class="block w-full bg-primary p-2"
    class:hidden={!open}
  >
    {@render children?.(open)}
  </div>
</div>
