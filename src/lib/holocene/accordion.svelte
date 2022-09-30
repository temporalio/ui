<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import Badge from '$holocene/badge.svelte';
  import type { IconName } from './icon/paths';

  type $$Props = ComponentProps<
    HTMLDivElement,
    {
      title: string;
      subtitle?: string;
      icon?: string;
      open?: boolean;
      disabled?: boolean;
      readOnly?: boolean;
      error?: string;
    }
  >;

  export let title: string;
  export let subtitle: string = '';
  export let icon: IconName = null;
  export let open: boolean = false;
  export let disabled: boolean = false;
  export let readOnly: boolean = false;
  export let error: string = '';

  $: open = disabled ? true : open;
</script>

<div
  class="flex w-full cursor-default flex-row rounded-lg border border-gray-300 bg-white p-8 text-primary {$$props.class}"
  {...$$restProps}
>
  <div class="w-full">
    <div
      class="accordion-open flex {!readOnly ? 'cursor-pointer' : ''} flex-col"
      class:open
      class:disabled
      on:click={() => {
        if (disabled || readOnly) return;
        open = !open;
      }}
    >
      <div class="space-between flex flex-row">
        <h2 class="flex w-full items-center gap-2 text-lg font-medium">
          {#if icon}<Icon name={icon} />{/if}
          {title}
        </h2>
        <div class="mr-1" on:click|stopPropagation>
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
        {#if error} <Badge class="mr-2" type="error">{error}</Badge> {/if}
        {subtitle}
      </h3>
    </div>
    <div class="hidden w-full" class:content={open}>
      <slot />
    </div>
  </div>
</div>

<style lang="postcss">
  .open {
    @apply mb-8;
  }

  .content {
    @apply block;
  }
  .disabled {
    @apply cursor-default;
  }
</style>
