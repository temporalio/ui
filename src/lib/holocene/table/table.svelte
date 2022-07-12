<script lang="ts">
  export let variant: 'simple' | 'fancy' = 'fancy';
</script>

<table class="{variant} {$$props.class}">
  <thead>
    <slot name="headers" />
  </thead>
  <tbody>
    <slot />
  </tbody>
</table>

<style lang="postcss">
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

      :global(th) {
        @apply border-t border-gray-300 py-3 px-1;

        &:first-child {
          @apply w-0 rounded-tl-lg border-l border-gray-300;
        }

        &:last-child {
          @apply w-0 rounded-tr-lg border-r border-gray-300;
        }
      }
    }

    tbody :global {
      td {
        @apply border-t border-gray-300 px-1 py-3 text-sm;

        &:first-child {
          @apply border-l border-gray-300;
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
