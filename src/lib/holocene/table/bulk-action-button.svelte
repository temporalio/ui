<script lang="ts">
  export let testId: string = null;
  export let disabled = false;
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
    @apply rounded border px-2 py-1 text-xs leading-3 text-offWhite;
  }

  .bulk-action-button.primary {
    @apply border-offWhite bg-offBlack from-blue-100 to-purple-100 hover:border-primary hover:bg-gradient-to-br hover:text-offBlack;
  }

  .bulk-action-button.destructive {
    @apply border-danger bg-danger hover:border-red-900 hover:bg-red-900;
  }

  .bulk-action-button:disabled {
    @apply cursor-not-allowed opacity-75;
  }
</style>
