<script lang="ts">
  export let value: string = '';
  export let disabled: boolean = false;
  export let placeholder: string = '';
  export let rows: number = 5;
  export let error: string = null;
  let hasError = error || $$slots.error;
</script>

<textarea
  class="font-mono min-h-fit w-full rounded border border-gray-900 p-5 text-sm"
  class:error={hasError}
  bind:value
  {disabled}
  {placeholder}
  {rows}
/>
{#if hasError}
  <div class="error-msg">
    {#if $$slots.error}
      <slot name="error" />
    {:else}
      <p>{error}</p>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .error {
    @apply border-danger;
  }

  .error-msg {
    @apply border-danger font-primary text-sm font-normal text-danger;
  }
</style>
