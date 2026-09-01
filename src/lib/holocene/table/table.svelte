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
    ...rest
  }: Props = $props();
</script>

<table
  class={merge(
    'holocene-table relative w-full border-collapse overflow-hidden rounded-lg',
    fixed ? 'layout-fixed' : 'layout-auto',
    className,
  )}
  class:bordered
  aria-busy={updating ? 'true' : undefined}
  {...rest}
>
  {@render caption?.()}
  <thead class="holocene-table-header">
    {@render headers?.()}
    {#if updating}
      <tr aria-hidden="true" class="!h-0 bg-transparent">
        <th colspan="1000" class="relative !h-0 !border-0 !p-0">
          <ProgressBar subtle class="bottom-0" />
        </th>
      </tr>
    {/if}
  </thead>
  <tbody class="holocene-table-body">
    {@render children?.()}
  </tbody>
</table>

<style lang="postcss">
  .holocene-table {
    @apply table-auto bg-surface-primary text-primary;

    &.bordered {
      @apply border border-primary;
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
    @apply sticky top-0 z-10 border-b border-primary;

    :global(tr) {
      @apply bg-surface-secondary text-primary;
    }

    :global(tr > th) {
      @apply h-9 px-2 text-left text-sm font-medium;
    }
  }

  :where(.holocene-table-body) {
    :global(tr) {
      @apply border-b border-primary last-of-type:border-0 hover:bg-interactive-tertiary-hover hover:bg-fixed;
    }

    :global(tr.expanded) {
      @apply w-full hover:bg-surface-primary;
    }

    :global(tr:nth-of-type(even)) {
      @apply bg-surface-overlay-primary;
    }

    :global(tr > td) {
      @apply px-2;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-brand hover:underline hover:decoration-brand;
    }

    :global(tr:not(.empty)) {
      @apply h-8 border-b border-primary last-of-type:border-0 hover:bg-interactive-tertiary-hover hover:bg-fixed;
    }
  }
</style>
