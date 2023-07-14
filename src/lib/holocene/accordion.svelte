<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';
  
  import { v4 } from 'uuid';
  
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  
  import type { IconName } from './icon/paths';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    id?: string;
    subtitle?: string;
    icon?: IconName;
    open?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    error?: string;
    onToggle?: () => void;
    'data-testid'?: string;
  }

  export let title: string;
  export let id: string = v4();
  export let subtitle = '';
  export let icon = null;
  export let open = false;
  export let disabled = false;
  export let readOnly = false;
  export let error = '';
  export let onToggle = noop;

  let className = '';
  export { className as class };

  $: open = disabled ? true : open;

  const toggleAccordion = () => {
    if (disabled || readOnly) return;
    open = !open;
    onToggle();
  };
</script>

<div
  class="flex w-full cursor-default flex-col rounded-xl border-2 border-gray-900 bg-white p-4 text-primary {className}"
  {...$$restProps}
>
  <button
    id="{id}-trigger"
    aria-expanded={open}
    aria-controls="{id}-content"
    class="flex w-full flex-col"
    disabled={disabled || readOnly}
    type="button"
    on:click={toggleAccordion}
  >
    <div class="space-between flex w-full flex-row items-center">
      <h2 class="flex w-full items-center gap-2 text-lg font-medium">
        {#if icon}<Icon name={icon} />{/if}
        {title}
        <slot name="summary" />
      </h2>
      <div
        class="flex flex-row items-center"
        on:click|stopPropagation
        on:keyup|stopPropagation
      >
        <slot name="action" />
      </div>
      {#if !readOnly}
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          class="rounded-full from-blue-100 to-purple-100 hover:bg-gradient-to-br {disabled
            ? 'text-gray-500'
            : 'text-primary'}"
        />
      {/if}
    </div>
    <h3 class="flex items-center">
      {#if error}
        <Badge class="mr-2" type="error">{error}</Badge>
      {/if}
      {subtitle}
    </h3>
  </button>
  <div
    id="{id}-content"
    aria-labelledby="{id}-trigger"
    class="mt-8 block w-full"
    class:hidden={!open}
  >
    <slot />
  </div>
</div>
