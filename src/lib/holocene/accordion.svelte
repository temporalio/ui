<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import type { IconName } from './icon/paths';
  import type { HoloceneComponentProps } from 'src/types/holocene';
  import { v4 } from 'uuid';

  interface $$Props extends HoloceneComponentProps<'div'> {
    title: string;
    id?: string;
    subtitle?: string;
    icon?: IconName;
    open?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    error?: string;
  }

  export let title: string;
  export let id: string = v4();
  export let subtitle = '';
  export let icon = null;
  export let open = false;
  export let disabled = false;
  export let readOnly = false;
  export let error = '';

  let className = '';
  export { className as class };

  $: open = disabled ? true : open;

  const toggleAccordion = () => {
    if (disabled || readOnly) return;
    open = !open;
  };
</script>

<div
  class="flex w-full cursor-default flex-col rounded-xl border-[3px] border-gray-900 bg-white p-4 text-primary {className}"
  {...$$restProps}
>
  <button
    id="{id}-trigger"
    aria-expanded={open}
    aria-controls="{id}-content"
    class="accordion-open flex w-full flex-col"
    disabled={disabled || readOnly}
    type="button"
    on:click={toggleAccordion}
  >
    <div class="space-between flex w-full flex-row items-center">
      <h2 class="flex w-full items-center gap-2 text-lg font-medium">
        {#if icon}<Icon name={icon} />{/if}
        {title}
      </h2>
      <div class="mr-1" on:click|stopPropagation on:keyup|stopPropagation>
        <slot name="action" />
      </div>
      {#if !readOnly}
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          class={disabled ? 'text-gray-500' : 'text-primary'}
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
