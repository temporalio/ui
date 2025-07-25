<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  interface $$Props extends HTMLTableAttributes {
    variant?: 'simple' | 'split' | 'primary';
    updating?: boolean;
    class?: string;
    'data-testid'?: string;
    fixed?: boolean;
    bordered?: boolean;
  }

  let className = '';
  export { className as class };
  export let variant: 'simple' | 'split' | 'primary' = 'primary';
  export let updating = false;
  export let fixed = false;
  export let bordered = true;
</script>

<table
  class={merge(
    'holocene-table relative w-full border-separate border-spacing-0',
    fixed ? 'table-fixed' : 'table-auto',
    variant,
    className,
  )}
  class:bordered
  {...$$restProps}
>
  <slot name="caption" />
  <thead class={merge('holocene-table-header', variant)}>
    <slot name="headers" />
    {#if updating}
      <ProgressBar />
    {/if}
  </thead>
  <tbody class={merge('holocene-table-body', variant)}>
    <slot />
  </tbody>
</table>

<style lang="postcss">
  .holocene-table {
    &.primary {
      @apply surface-primary;

      &.bordered {
        @apply border border-subtle;
      }
    }
  }

  .holocene-table-header {
    @apply sticky top-0 z-10;

    &.simple {
      :global(tr > th) {
        @apply border-b border-primary p-2;
      }
    }

    &.primary,
    &.split {
      :global(tr) {
        @apply surface-table-header;
      }
    }

    :global(tr > th) {
      @apply h-9 whitespace-nowrap border-b border-subtle px-2 text-left text-sm font-medium;
    }
  }

  .holocene-table-body {
    &.simple {
      :global(tr > td) {
        @apply h-8 whitespace-nowrap border-b border-primary px-2;
      }
    }

    &.primary,
    &.split {
      :global(tr) {
        @apply border-b border-subtle last-of-type:border-0 hover:bg-interactive-table-hover hover:bg-fixed;
      }

      :global(tr.expanded) {
        @apply w-full hover:bg-primary;
      }

      :global(tr:nth-of-type(odd)) {
        @apply surface-background;
      }

      :global(tr > td) {
        @apply whitespace-nowrap px-2;
      }

      :global(tr > td > .table-link) {
        @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
      }

      :global(tr:not(.empty)) {
        @apply h-8 border-b border-subtle last-of-type:border-0 hover:bg-interactive-table-hover hover:bg-fixed;
      }
    }
  }
</style>
