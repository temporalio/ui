<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  interface Props extends HTMLTableAttributes {
    updating?: boolean;
    class?: string;
    'data-testid'?: string;
    fixed?: boolean;
    bordered?: boolean;
    caption?: Snippet;
    headers?: Snippet;
    children?: Snippet;
  }

  let {
    class: className = '',
    updating = false,
    fixed = false,
    bordered = true,
    caption,
    headers,
    children,
    ...restProps
  }: Props = $props();
</script>

<table
  class={merge(
    'holocene-table relative w-full border-separate border-spacing-0',
    fixed ? 'layout-fixed' : 'layout-auto',
    className,
  )}
  class:bordered
  {...restProps}
>
  {@render caption?.()}
  <thead class="holocene-table-header">
    {@render headers?.()}
    {#if updating}
      <ProgressBar />
    {/if}
  </thead>
  <tbody class="holocene-table-body">
    {@render children?.()}
  </tbody>
</table>

<style lang="postcss">
  .holocene-table {
    @apply surface-primary table-auto;

    &.bordered {
      @apply border border-subtle;
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
      @apply h-9 border-b border-subtle px-2 text-left text-sm font-medium;
    }
  }

  .holocene-table-body {
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
      @apply px-2;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }

    :global(tr:not(.empty)) {
      @apply h-8 border-b border-subtle last-of-type:border-0 hover:bg-interactive-table-hover hover:bg-fixed;
    }
  }
</style>
