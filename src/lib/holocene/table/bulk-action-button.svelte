<script lang="ts">
  export let testId: string = null;
  export let disabled: boolean = false;
  export let variant: 'primary' | 'destructive' = 'primary';
</script>

<button
  data-testid={testId}
  {disabled}
  on:click
  class="bulk-action-button {variant} {$$props.class}"
>
  <slot />
</button>

<style lang="postcss">
  .bulk-action-button {
    @apply rounded border px-2 py-1 text-xs leading-3 text-white;
  }

  .bulk-action-button.primary {
    @apply border-white bg-primary from-blue-100 to-purple-100 hover:border-gray-900 hover:bg-gradient-to-br hover:text-gray-900;
  }

  .bulk-action-button.destructive {
    @apply border-danger bg-danger hover:border-red-900 hover:bg-red-900;
  }

  .bulk-action-button:disabled {
    @apply pointer-events-none cursor-not-allowed opacity-75;
  }
</style>
