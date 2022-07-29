<script lang="ts">
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import Icon from '$lib/holocene/icon/index.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let id: string;
  export let value: string;
  export let label = '';
  export let icon: IconName = '';
  export let placeholder = '';
  export let name = id;
  export let copyable: boolean = false;
  export let disabled = false;
  export let theme: 'dark' | 'light' = 'light';
  export let autocomplete = false;
  export let valid = true;
  export let hintText = '';
  export let maxLength = 0;

  const { copy, copied } = copyToClipboard(value);
</script>

<div class={$$props.class}>
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <div class="input-container {theme}" class:copyable class:invalid={!valid}>
    {#if icon !== ''}
      <span class="icon-container">
        <Icon name={icon} scale={0.9} stroke="currentcolor" />
      </span>
    {/if}
    <input
      class="m-2 block w-full bg-white focus:outline-none"
      class:copyable
      disabled={disabled || copyable}
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
      <div class="copy-icon-container" on:click={copy}>
        <Icon name={$copied ? 'checkMark' : 'copy'} stroke="currentcolor" />
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

<style lang="postcss">
  /* Base styles */
  label {
    @apply mb-10 font-secondary text-sm font-medium;
  }

  .input-container {
    @apply relative box-border inline-flex h-10 w-full items-center rounded border border-gray-900 text-sm focus-within:border-blue-700;
  }

  .input-container.copyable {
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

  .input-container.light.copyable {
    @apply border-gray-900 bg-gray-50;
  }

  .input-container.light.copyable input {
    @apply bg-gray-50 text-gray-900;
  }

  .input-container.light.copyable .copy-icon-container {
    @apply border-gray-900 bg-gray-200;
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

  .input-container.dark.copyable,
  .input-container.dark.copyable .copy-icon-container,
  .input-container.dark.copyable input {
    @apply border-gray-900 bg-gray-900;
  }
</style>
