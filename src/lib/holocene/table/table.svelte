<script lang="ts">
  import ProgressBar from '$lib/holocene/progress-bar.svelte';
  import type { HTMLTableAttributes } from 'svelte/elements';

  interface $$Props extends HTMLTableAttributes {
    variant?: 'simple' | 'fancy';
    updating?: boolean;
    class?: string;
    'data-testid'?: string;
  }

  let className: string = '';
  export { className as class };
  export let variant: 'simple' | 'fancy' = 'fancy';
  export let updating = false;
</script>

<table class="{variant} {className}" {...$$restProps}>
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
      @apply text-left font-secondary text-sm font-medium;
    }

    tbody :global(td) {
      @apply text-left text-sm;
    }
  }

  table.fancy {
    @apply border-separate border-spacing-0 rounded-xl border-[3px] border-gray-900 bg-white;

    thead {
      @apply bg-gray-900 text-gray-100;

      :global(th) {
        @apply border-t border-gray-900 px-1 py-2;

        &:first-child {
          @apply w-[1px] rounded-tl-lg border-l border-gray-900;
        }

        &:last-child {
          @apply w-[1px] rounded-tr-lg border-r border-gray-900;
        }
      }
    }

    tbody :global {
      td {
        @apply border-t border-gray-900 px-1 py-2 text-sm;

        &:first-child {
          @apply border-l border-gray-900 px-1;
        }

        &:first-child:is(.expanded-cell) {
          @apply px-0;
        }

        &:last-child {
          @apply w-0 border-r border-gray-900 p-0;
        }
      }

      &:last-child {
        td {
          @apply border-b border-gray-900;

          &:first-child {
            @apply rounded-bl-lg;
          }

          &:last-child {
            @apply rounded-br-lg;
          }
        }
      }

      tbody :global {
        td {
          &:first-child {
            &:first-child {
              @apply rounded-bl-none;
            }
          }

          &:last-child {
            &:last-child {
              @apply rounded-br-none;
            }
          }
        }
      }
    }
  }

  table.simple {
    thead :global(th) {
      @apply border-b border-primary py-2;
    }

    tbody :global(td) {
      @apply border-b border-gray-900 py-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
