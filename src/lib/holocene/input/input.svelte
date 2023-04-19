<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import IconButton from '../icon-button.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { IconName } from '$lib/holocene/icon/paths';
  interface $$Props extends HTMLInputAttributes {
    id: string;
    value: string;
    label?: string;
    icon?: IconName;
    suffix?: string;
    copyable?: boolean;
    clearable?: boolean;
    theme?: 'dark' | 'light';
    valid?: boolean;
    hintText?: string;
    maxLength?: number;
    spellcheck?: boolean;
    unroundRight?: boolean;
    unroundLeft?: boolean;
    autoFocus?: boolean;
    error?: boolean;
  }

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
  export let autocomplete = 'off';
  export let valid = true;
  export let hintText = '';
  export let maxLength = 0;
  export let spellcheck: boolean = null;
  export let unroundRight: boolean = false;
  export let unroundLeft: boolean = false;
  export let autoFocus = false;
  export let error = false;
  export let required = false;

  let className = '';
  export { className as class };

  function callFocus(input: HTMLInputElement) {
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

<div class={className}>
  {#if label}
    <label class:required for={id}>{label}</label>
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
      {spellcheck}
      {required}
      {autocomplete}
      bind:value
      on:click|stopPropagation
      on:input
      on:keydown|stopPropagation
      on:change
      on:focus
      on:blur
      use:callFocus
      {...$$restProps}
    />
    {#if suffix}
      <div class="suffix">
        {suffix}
      </div>
    {/if}
    {#if copyable}
      <div class="copy-icon-container">
        <IconButton
          on:click={(e) => copy(e, value)}
          icon={$copied ? 'checkmark' : 'copy'}
        />
      </div>
    {:else if disabled}
      <div class="flex h-full w-9 items-center justify-center">
        <Icon name="lock" />
      </div>
    {:else if clearable && value}
      <div class="clear-icon-container" data-testid="clear-input">
        <IconButton on:click={onClear} icon="close" />
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
    <span class="hint-text" class:invalid={!valid} class:error>{hintText}</span>
  {/if}
</div>

<style lang="postcss">
  /* Base styles */
  label {
    @apply mb-10 font-secondary text-sm font-medium;
  }

  label.required {
    @apply after:content-["*"];
  }

  .input-container {
    @apply relative box-border inline-flex h-10 w-full items-center rounded border border-gray-900 text-sm focus-within:border-blue-700;
  }

  .input-container.error {
    @apply border-2 border-red-700;
  }

  .suffix {
    @apply block h-full w-full rounded-tr rounded-br border-l border-gray-900 bg-offWhite p-2;
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

  .clear-icon-container {
    @apply mr-2 flex w-6 cursor-pointer items-center justify-center rounded-full text-primary hover:bg-gray-200;
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

  .hint-text {
    @apply mt-2 inline-block text-xs;
  }

  .hint-text.error,
  .hint-text.invalid {
    @apply text-red-700;
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

  input[type='search']::-webkit-search-cancel-button {
    @apply hidden;
  }
</style>
