<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title' | 'children'
  > {
    id?: string;
    icon?: IconName;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    onToggle?: () => Promise<void>;
    class?: string;
    'data-testid'?: string;
    title?: Snippet;
    description?: Snippet;
    action?: Snippet;
    children?: Snippet<[boolean]>;
  }

  let {
    id = crypto.randomUUID(),
    open = $bindable(false),
    onToggle,
    icon,
    class: className,
    title,
    description,
    action,
    children,
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

<div class="w-full {className}">
  <div class="flex w-full flex-row items-center">
    <button
      id="{id}-trigger"
      aria-expanded={open}
      aria-controls="{id}-content"
      class="focus-visible:outline-interactive grow cursor-pointer hover:bg-interactive-secondary-hover"
      type="button"
      onclick={toggleAccordion}
    >
      <div class="flex w-full flex-row items-center justify-between gap-2 pr-4">
        {@render title?.()}
        {@render description?.()}
        <Icon name={icon ? icon : open ? 'arrow-down' : 'arrow-right'} />
      </div>
    </button>
    <div class="flex shrink-0 items-center gap-4 pr-4">
      {@render action?.()}
    </div>
  </div>
  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    class="block w-full bg-primary p-2"
    class:hidden={!open}
  >
    {@render children?.(open)}
  </div>
</div>
