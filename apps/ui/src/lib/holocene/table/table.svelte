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
    @apply surface-primary border-separate border-spacing-0 border border-table;

    thead {
      @apply surface-table;

      :global(th) {
        @apply border-t border-table p-2 text-off-white;
      }

      :global(td) {
        @apply border-t border-table p-2;

        &:first-child {
          @apply border-l border-table;
        }

        &:last-child {
          @apply border-r border-table;
        }
      }
    }

    tbody :global {
      td {
        @apply border-t border-table p-2 text-sm;

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
