<script lang="ts">
  export let dataCy: string = null;
  export let disabled: boolean = true;
</script>

<button data-cy={dataCy} {disabled} on:click class="bulk-action-button">
  <slot />
</button>

<style lang="postcss">
  .bulk-action-button {
    @apply rounded border border-danger bg-danger px-2 py-1 leading-3 text-white hover:border-white hover:bg-blue-700;
  }

  .bulk-action-button:disabled {
    @apply pointer-events-none cursor-not-allowed opacity-75;
  }
</style>
