<script lang="ts">
  export let dataCy: string = null;
  export let disabled: boolean = false;
  export let variant: 'primary' | 'destructive' = 'primary';
</script>

<button
  data-cy={dataCy}
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
    @apply border-white bg-primary hover:bg-blue-700;
  }

  .bulk-action-button.destructive {
    @apply border-danger bg-danger hover:border-white hover:bg-blue-700;
  }

  .bulk-action-button:disabled {
    @apply pointer-events-none cursor-not-allowed opacity-75;
  }
</style>
