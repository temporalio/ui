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
  @reference "tailwindcss";

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
    @apply surface-primary border-table border-separate border-spacing-0 border;

    thead {
      @apply surface-table;

      :global(th) {
        @apply border-table text-off-white border-t p-2;
      }

      :global(td) {
        @apply border-table border-t p-2;

        &:first-child {
          @apply border-table border-l;
        }

        &:last-child {
          @apply border-table border-r;
        }
      }
    }

    tbody :global {
      td {
        @apply border-table border-t p-2 text-sm;

        &:first-child:is(.expanded-cell) {
          @apply px-0;
        }
      }
    }
  }

  table.simple {
    thead :global(td),
    thead :global(th) {
      @apply border-primary border-b p-2;
    }

    tbody :global(td) {
      @apply border-b p-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
