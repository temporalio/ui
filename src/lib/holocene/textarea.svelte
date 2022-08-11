<script lang="ts">
  import { noop } from 'svelte/internal';
  export let disabled: boolean = false;
  export let error: string = '';
  export let isValid: boolean = true;
  export let placeholder: string = '';
  export let rows: number = 5;
  export let spellcheck: boolean = null;
  export let value: string;
  export let onBlur: (e: Event) => void = noop;
</script>

<textarea
  class="font-mono min-h-fit w-full rounded border border-gray-900 py-2 px-3 text-sm"
  class:error={!isValid}
  bind:value
  on:blur={onBlur}
  {disabled}
  {placeholder}
  {rows}
  {spellcheck}
/>
<div class="error-msg" aria-live={isValid ? 'off' : 'assertive'}>
  {#if !isValid}
    {#if error}
      <p>{error}</p>
    {/if}
    <slot name="error" />
  {/if}
</div>

<style lang="postcss">
  .error {
    @apply border-danger;
  }

  .error-msg {
    @apply border-danger font-primary text-sm font-normal text-danger;
  }
</style>
