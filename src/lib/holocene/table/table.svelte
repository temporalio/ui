<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  interface $$Props extends HTMLTableAttributes {
    variant?: 'simple' | 'fancy';
    updating?: boolean;
    class?: string;
    'data-testid'?: string;
  }

  let className = '';
  export { className as class };
  export let variant: 'simple' | 'fancy' = 'fancy';
  export let updating = false;
</script>

<table class={merge(variant, className)} {...$$restProps}>
  <slot name="caption" />
  <thead>
    <slot name="headers" />
    {#if updating}
      <ProgressBar />
    {/if}
  </thead>
  <tbody>
    <slot />
  </tbody>
</table>

<style lang="postcss">
  table {
    @apply relative;

    thead :global(th) {
      @apply text-left text-sm font-medium;
    }

    tbody :global(td) {
      @apply text-left text-sm;
    }
  }

  table.fancy {
    @apply surface-primary border-separate border-spacing-0 border border-subtle;

    thead {
      @apply surface-table-header;

      :global(th) {
        @apply border-b border-subtle p-2 text-sm;
      }

      :global(td) {
        @apply border-t border-subtle p-2;

        &:first-child {
          @apply border-l border-subtle;
        }

        &:last-child {
          @apply border-r border-subtle;
        }
      }
    }

    tbody :global {
      tr:nth-of-type(odd) {
        @apply surface-background;
      }

      tr {
        @apply border-b border-subtle last-of-type:border-0;
      }

      td {
        @apply p-2 text-sm;

        &:first-child:is(.expanded-cell) {
          @apply px-0;
        }
      }
    }
  }

  table.simple {
    thead :global(td),
    thead :global(th) {
      @apply border-b border-primary p-2;
    }

    tbody :global(td) {
      @apply border-b p-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
