<script>import { noop } from 'svelte/internal';
export let disabled = false;
export let error = '';
export let isValid = true;
export let placeholder = '';
export let rows = 5;
export let spellcheck = null;
export let value;
export let onBlur = noop;
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

<style>
  .error {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity))
}

  .error-msg {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity));

    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 400;

    --tw-text-opacity: 1;

    color: rgb(185 28 28 / var(--tw-text-opacity))
}</style>
