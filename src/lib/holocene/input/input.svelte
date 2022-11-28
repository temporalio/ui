<script lang="ts">
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import Icon from '$holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import { createEventDispatcher } from 'svelte';

  export let id: string;
  export let value: string;
  export let label = '';
  export let icon: IconName = null;
  export let placeholder = '';
  export let suffix = '';
  export let name = id;
  export let copyable: boolean = false;
  export let disabled = false;
  export let clearable = false;
  export let theme: 'dark' | 'light' = 'light';
  export let autocomplete = false;
  export let valid = true;
  export let hintText = '';
  export let maxLength = 0;
  export let spellcheck: boolean = null;
  export let unroundRight: boolean = false;
  export let unroundLeft: boolean = false;
  export let autoFocus = false;
  export let error = false;

  function callFocus(input) {
    if (autoFocus) input.focus();
  }

  const dispatch = createEventDispatcher();
  function onClear() {
    value = '';
    dispatch('clear', {});
  }

  const { copy, copied } = copyToClipboard();
  $: disabled = disabled || copyable;
</script>

<div class={$$props.class}>
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <div
    class="input-container {theme}"
    class:disabled
    class:error
    class:unroundRight={unroundRight ?? suffix}
    class:unroundLeft
    class:invalid={!valid}
  >
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
      {spellcheck}
      bind:value
      on:input
      on:change
      on:focus
      on:blur
      use:callFocus
    />
    {#if suffix}
      <div class="suffix">
        {suffix}
      </div>
    {/if}
    {#if copyable}
      <div class="copy-icon-container" on:click={(e) => copy(e, value)}>
        <Icon name={$copied ? 'checkmark' : 'copy'} />
      </div>
    {:else if disabled}
      <div class="flex h-full w-9 items-center justify-center">
        <Icon name="lock" />
      </div>
    {:else if clearable && value}
      <div
        class="mr-2 flex h-full h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-gray-200"
        data-cy="clear-input"
        on:click={onClear}
      >
        <Icon name="close" />
      </div>
    {/if}
    {#if maxLength && !suffix && !disabled}
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

<style lang="postcss">
  /* Base styles */
  label {
    @apply mb-10 font-secondary text-sm font-medium;
  }

  .input-container {
    @apply relative box-border inline-flex h-10 w-full items-center rounded border border-gray-900 text-sm focus-within:border-blue-700;
  }

  .input-container.error {
    @apply border-2 border-red-700;
  }

  .suffix {
    @apply block h-full w-full rounded-tr rounded-br border-l border-gray-900 bg-gray-100 p-2;
  }

  .input-container:active .suffix {
    @apply border-blue-700;
  }

  .input-container.error .suffix {
    @apply border-red-700 bg-red-100;
  }

  .unroundRight {
    @apply rounded-tr-none rounded-br-none;
  }

  .unroundLeft {
    @apply rounded-tl-none rounded-bl-none border-l-0;
  }

  .input-container.disabled {
    @apply border;
  }

  .icon-container {
    @apply ml-2 flex items-center justify-center;
  }

  .copy-icon-container {
    @apply flex h-full w-9 cursor-pointer items-center justify-center rounded-r border-l;
  }

  .input-container.invalid {
    @apply border-red-700 text-red-700;
  }

  .count {
    @apply invisible mr-2 font-secondary text-sm font-medium text-primary;
  }

  .count > .warn {
    @apply text-orange-600;
  }

  .count > .error {
    @apply text-red-700;
  }

  input:focus + .count {
    @apply visible;
  }

  /* Light theme styles */
  .input-container.light,
  .input-container.light .icon-container,
  .input-container.light input {
    @apply bg-white;
  }

  .input-container.light .icon-container {
    @apply text-gray-400;
  }

  .input-container.light.disabled {
    @apply border-gray-600 bg-gray-50  text-gray-600;
  }

  .input-container.light.disabled input {
    @apply bg-gray-50;
  }

  .input-container.light.disabled .copy-icon-container {
    @apply border-gray-600 bg-gray-200;
  }

  /* Dark theme styles */
  .input-container.dark,
  .input-container.dark .icon-container,
  .input-container.dark input,
  .input-container.dark .copy-icon-container {
    @apply bg-gray-900 text-white;
  }

  .input-container.dark input {
    @apply placeholder:text-gray-200;
  }

  .input-container.dark.disabled,
  .input-container.dark.disabled .copy-icon-container,
  .input-container.dark.disabled input {
    @apply border-gray-900 bg-gray-900;
  }
</style>
