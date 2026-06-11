<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  interface $$Props extends HTMLTableAttributes {
    updating?: boolean;
    class?: string;
    'data-testid'?: string;
    fixed?: boolean;
    bordered?: boolean;
  }

  let className = '';
  export { className as class };
  export let updating = false;
  export let fixed = false;
  export let bordered = true;
</script>

<table
  class={merge(
    'holocene-table relative w-full border-separate border-spacing-0',
    fixed ? 'layout-fixed' : 'layout-auto',
    className,
  )}
  class:bordered
  {...$$restProps}
>
  <slot name="caption" />
  <thead class="holocene-table-header">
    <slot name="headers" />
    {#if updating}
      <ProgressBar />
    {/if}
  </thead>
  <tbody class="holocene-table-body">
    <slot />
  </tbody>
</table>

<style lang="postcss">
  .holocene-table {
    @apply surface-primary table-auto;

    &.bordered {
      @apply border-subtle border;
    }

    &.layout-auto {
      @apply table-auto;
    }

    &.layout-fixed {
      @apply table-fixed;
    }
  }

  .holocene-table.layout-auto > .holocene-table-header {
    :global(tr > th) {
      @apply whitespace-nowrap;
    }
  }

  .holocene-table.layout-auto > .holocene-table-body {
    :global(tr > td) {
      @apply whitespace-nowrap;
    }
  }

  .holocene-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply surface-table-header;
    }

    :global(tr > th) {
      @apply border-subtle h-9 border-b px-2 text-left text-sm font-medium;
    }
  }

  :where(.holocene-table-body) {
    :global(tr) {
      @apply border-subtle hover:bg-interactive-table-hover border-b last-of-type:border-0 hover:bg-fixed;
    }

    :global(tr.expanded) {
      @apply hover:bg-primary w-full;
    }

    :global(tr:nth-of-type(odd)) {
      @apply surface-background;
    }

    :global(tr > td) {
      @apply px-2;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }

    :global(tr:not(.empty)) {
      @apply border-subtle hover:bg-interactive-table-hover h-8 border-b last-of-type:border-0 hover:bg-fixed;
    }
  }
</style>
