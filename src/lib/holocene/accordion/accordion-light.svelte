<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';
  import { slide } from 'svelte/transition';

  import { twMerge as merge } from 'tailwind-merge';
  import { v4 } from 'uuid';

  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    id?: string;
    subtitle?: string;
    icon?: IconName;
    open?: boolean;
    expandable?: boolean;
    error?: string;
    onToggle?: () => void;
    'data-testid'?: string;
  }

  export let title: string;
  export let id: string = v4();
  export let subtitle = '';
  export let icon = null;
  export let open = false;
  export let error = '';
  export let onToggle = noop;

  let className = '';
  export { className as class };

  const toggleAccordion = () => {
    open = !open;
    onToggle();
  };
</script>

<div
  class={merge(
    'w-full cursor-pointer rounded border-2 border-interactive hover:bg-interactive-secondary-hover focus-visible:bg-interactive focus-visible:outline-none',
    className,
  )}
  {...$$restProps}
>
  <button
    id="{id}-trigger"
    aria-expanded={open}
    aria-controls="{id}-content"
    class="w-full"
    type="button"
    on:click={toggleAccordion}
  >
    <div class="flex w-full flex-row items-center justify-between gap-2">
      <slot name="title" />
      <slot name="description" />
      <div
        class="flex flex-row items-center gap-2 pr-2"
        on:click|stopPropagation
        on:keyup|stopPropagation
        role="none"
      >
        <slot name="action" />
        <Icon class="m-2 shrink-0" name={open ? 'arrow-down' : 'arrow-right'} />
      </div>
    </div>
    <p class="flex items-center">
      {#if error}
        <Badge class="mr-2" type="danger">{error}</Badge>
      {/if}
      {subtitle}
    </p>
  </button>

  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    role="textbox"
    class="mt-2 block w-full rounded-b"
    class:hidden={!open}
    transition:slide
  >
    <slot {open} />
  </div>
</div>
