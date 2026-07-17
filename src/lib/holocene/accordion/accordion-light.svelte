<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    id?: string;
    icon?: IconName;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    onToggle?: () => Promise<void>;
    'data-testid'?: string;
  }

  export let id: string = crypto.randomUUID();
  export let open = false;
  export let onToggle: (() => Promise<void>) | undefined = undefined;
  export let icon: IconName | undefined = undefined;

  const toggleAccordion = async () => {
    if (onToggle) {
      await onToggle();
      open = !open;
    } else {
      open = !open;
    }
  };
</script>

<div class="w-full {$$restProps.class}">
  <div class="flex w-full flex-row items-center">
    <button
      id="{id}-trigger"
      aria-expanded={open}
      aria-controls="{id}-content"
      class="focus-visible:outline-interactive grow cursor-pointer hover:bg-interactive-secondary-hover"
      type="button"
      on:click={toggleAccordion}
    >
      <div class="flex w-full flex-row items-center justify-between gap-2 pr-4">
        <slot name="title" />
        <slot name="description" />
        <Icon name={icon ? icon : open ? 'arrow-down' : 'arrow-right'} />
      </div>
    </button>
    <div class="flex shrink-0 items-center gap-4 pr-4">
      <slot name="action" />
    </div>
  </div>
  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    class="block w-full bg-primary p-2"
    class:hidden={!open}
  >
    <slot {open} />
  </div>
</div>
