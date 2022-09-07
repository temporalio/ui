<script>import { copyToClipboard } from '../../utilities/copy-to-clipboard';
import Icon from '$holocene/icon/icon.svelte';
export let id;
export let value;
export let label = '';
export let icon = null;
export let placeholder = '';
export let name = id;
export let copyable = false;
export let disabled = false;
export let theme = 'light';
export let autocomplete = false;
export let valid = true;
export let hintText = '';
export let maxLength = 0;
const { copy, copied } = copyToClipboard();
$: disabled = disabled || copyable;
</script>

<div class={$$props.class}>
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <div class="input-container {theme}" class:disabled class:invalid={!valid}>
    {#if icon}
      <span class="icon-container">
        <Icon name={icon} />
      </span>
    {/if}
    <input
      class="m-2 block w-full bg-white focus:outline-none"
      class:disabled
      {disabled}
      data-lpignore="true"
      maxlength={maxLength > 0 ? maxLength : undefined}
      {placeholder}
      {id}
      {name}
      autocomplete={autocomplete ? 'on' : 'off'}
      bind:value
      on:input
      on:change
      on:focus
      on:blur
    />
    {#if copyable}
      <div class="copy-icon-container" on:click={(e) => copy(e, value)}>
        <Icon name={$copied ? 'checkmark' : 'copy'} />
      </div>
    {:else if disabled}
      <div class="flex h-full w-9 items-center justify-center">
        <Icon name="lock" />
      </div>
    {/if}
    {#if maxLength}
      <span class="count">
        <span
          class="text-blue-700"
          class:warn={maxLength - value.length <= 5}
          class:error={maxLength === value.length}>{value.length}</span
        >&nbsp;/&nbsp;{maxLength}
      </span>
    {/if}
  </div>
  {#if hintText}
    <span class="mt-1 text-xs text-red-700">{hintText}</span>
  {/if}
</div>

<style>
  /* Base styles */
  label {
    margin-bottom: 2.5rem;
    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500
}

  .input-container {
    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    height: 2.5rem;
    width: 100%;
    align-items: center;
    border-radius: 0.25rem;
    border-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(24 24 27 / var(--tw-border-opacity));
    font-size: 0.875rem;
    line-height: 1.25rem
}

  .input-container:focus-within {
    --tw-border-opacity: 1;
    border-color: rgb(29 78 216 / var(--tw-border-opacity))
}

  .input-container.disabled {
    border-width: 1px
}

  .icon-container {
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center
}

  .copy-icon-container {
    display: flex;
    height: 100%;
    width: 2.25rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    border-left-width: 1px
}

  .input-container.invalid {
    --tw-border-opacity: 1;
    border-color: rgb(185 28 28 / var(--tw-border-opacity));
    --tw-text-opacity: 1;
    color: rgb(185 28 28 / var(--tw-text-opacity))
}

  .count {
    visibility: hidden;
    margin-right: 0.5rem;
    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
    --tw-text-opacity: 1;
    color: rgb(24 24 27 / var(--tw-text-opacity))
}

  .count > .warn {
    --tw-text-opacity: 1;
    color: rgb(234 88 12 / var(--tw-text-opacity))
}

  .count > .error {
    --tw-text-opacity: 1;
    color: rgb(185 28 28 / var(--tw-text-opacity))
}

  input:focus + .count {
    visibility: visible
}

  /* Light theme styles */
  .input-container.light, 
  .input-container.light .icon-container, 
  .input-container.light input {
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity))
}

  .input-container.light .icon-container {
    --tw-text-opacity: 1;
    color: rgb(161 161 170 / var(--tw-text-opacity))
}

  .input-container.light.disabled {
    --tw-border-opacity: 1;
    border-color: rgb(82 82 91 / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: rgb(250 250 250 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(82 82 91 / var(--tw-text-opacity))
}

  .input-container.light.disabled input {
    --tw-bg-opacity: 1;
    background-color: rgb(250 250 250 / var(--tw-bg-opacity))
}

  .input-container.light.disabled .copy-icon-container {
    --tw-border-opacity: 1;
    border-color: rgb(82 82 91 / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: rgb(228 228 231 / var(--tw-bg-opacity))
}

  /* Dark theme styles */
  .input-container.dark, 
  .input-container.dark .icon-container, 
  .input-container.dark input, 
  .input-container.dark .copy-icon-container {
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .input-container.dark input::-moz-placeholder {
    --tw-text-opacity: 1;
    color: rgb(228 228 231 / var(--tw-text-opacity))
}

  .input-container.dark input:-ms-input-placeholder {
    --tw-text-opacity: 1;
    color: rgb(228 228 231 / var(--tw-text-opacity))
}

  .input-container.dark input::placeholder {
    --tw-text-opacity: 1;
    color: rgb(228 228 231 / var(--tw-text-opacity))
}

  .input-container.dark.disabled, 
  .input-container.dark.disabled .copy-icon-container, 
  .input-container.dark.disabled input {
    --tw-border-opacity: 1;
    border-color: rgb(24 24 27 / var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity))
}</style>
