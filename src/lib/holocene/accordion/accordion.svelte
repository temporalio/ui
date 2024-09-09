<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';

  import { twMerge as merge } from 'tailwind-merge';
  import { v4 } from 'uuid';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from './icon';

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
  export let expandable = true;
  export let error = '';
  export let onToggle = noop;

  let className = '';
  export { className as class };

  const toggleAccordion = () => {
    open = !open;
    onToggle();
  };
</script>

{#if expandable}
  <div
    class={merge(
      'surface-primary flex w-full cursor-default flex-col rounded-2xl border-2 border-subtle p-2 text-primary focus-within:ring-4 focus-within:ring-primary/70',
      className,
    )}
    {...$$restProps}
  >
    <button
      id="{id}-trigger"
      aria-expanded={open}
      aria-controls="{id}-content"
      class="flex w-full flex-col rounded-lg p-2 hover:bg-interactive-secondary-hover focus-visible:bg-interactive-secondary-hover focus-visible:outline-none"
      type="button"
      on:click={toggleAccordion}
    >
      <div class="space-between flex w-full flex-row items-center">
        <h3 class="flex w-full items-center gap-2">
          {#if icon}<Icon name={icon} />{/if}
          {title}
          <slot name="summary" />
        </h3>
        <div
          class="flex flex-row items-center gap-2 pr-2"
          on:click|stopPropagation
          on:keyup|stopPropagation
        >
          <slot name="action" />
        </div>
        <Icon class="m-2" name={open ? 'chevron-up' : 'chevron-down'} />
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
      class="mt-6 block w-full p-2"
      class:hidden={!open}
    >
      <slot />
    </div>
  </div>
{:else}
  <div
    class="surface-primary w-full rounded-2xl border-2 border-subtle p-4"
    {...$$restProps}
  >
    <div class="flex w-full flex-col rounded-lg">
      <div class="space-between flex w-full flex-row items-center">
        <h3 class="flex w-full items-center gap-2">
          {#if icon}<Icon name={icon} />{/if}
          {title}
          <slot name="summary" />
        </h3>
        <div class="flex flex-row items-center gap-2 pr-2">
          <slot name="action" />
        </div>
      </div>
      <p class="flex items-center">
        {#if error}
          <Badge class="mr-2" type="danger">{error}</Badge>
        {/if}
        {subtitle}
      </p>
    </div>

    <div class="mt-6 block w-full" class:hidden={!open}>
      <slot />
    </div>
  </div>
{/if}
