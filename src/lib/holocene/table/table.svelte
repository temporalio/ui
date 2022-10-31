<script lang="ts">
  import ProgressBar from '$lib/holocene/progress-bar.svelte';

  export let variant: 'simple' | 'fancy' = 'fancy';
  export let updating = false;
</script>

<table class="{variant} {$$props.class}">
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
  }

  table {
    thead :global(th) {
      @apply text-left font-secondary text-sm font-medium;
    }

    tbody :global(td) {
      @apply text-left text-sm;
    }
  }

  table.fancy {
    @apply border-separate border-spacing-0 rounded-lg border-gray-300;

    thead {
      @apply bg-gray-900 text-gray-100;

      :global(th.selectable) {
        @apply h-12 w-12 min-w-[36px] px-3;
      }

      :global(th) {
        @apply border-t border-gray-300 px-1 py-2;

        &:first-child {
          @apply rounded-tl-lg border-l border-gray-300;
        }

        &:first-child:not(.selectable) {
          @apply w-[1px];
        }

        &:last-child {
          @apply w-[1px] rounded-tr-lg border-r border-gray-300;
        }
      }
    }

    tbody :global {
      td.selectable {
        @apply w-12 px-3;
      }

      td {
        @apply border-t border-gray-300 py-2 text-sm;

        &:first-child {
          @apply border-l border-gray-300;
        }

        &:first-child:not(.selectable) {
          @apply px-1;
        }

        &:last-child {
          @apply w-0 border-r border-gray-300 p-0;
        }
      }

      &:last-child {
        td {
          @apply border-b border-gray-300;

          &:first-child {
            @apply rounded-bl-lg;
          }

          &:last-child {
            @apply rounded-br-lg;
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
      @apply border-b border-gray-300 py-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
