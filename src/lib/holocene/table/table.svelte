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
      @apply text-left text-sm font-medium font-secondary;
    }

    tbody :global(td) {
      @apply text-left text-sm;
    }
  }

  table.fancy {
    @apply border-separate rounded-lg border-gray-300 border-spacing-0;

    thead {
      @apply bg-gray-900 text-gray-100;

      :global(th) {
        @apply border-t border-gray-300 py-3 px-1;

        &:first-child {
          @apply rounded-tl-lg border-l border-gray-300 w-0;
        }

        &:last-child {
          @apply rounded-tr-lg border-r border-gray-300 w-0;
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
          @apply border-r border-gray-300 w-0 p-0;
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
      @apply border-primary border-b py-2;
    }

    tbody :global(td) {
      @apply border-gray-300 border-b py-2;
    }

    &:last-child {
      @apply border-b-0;
    }
  }
</style>
