<script lang="ts">
  export let id: string;
  export let value: string;
  export let label = '';
  export let units = '';
  export let placeholder = '';
  export let name = id;
  export let disabled = false;
  export let theme: 'dark' | 'light' = 'light';
  export let autocomplete = false;
  export let hintText = '';
  export let max: null | number = null;
  export let spellcheck: boolean = null;

  let valid = true;

  function validateNumber(value: string) {
    if (!value.match('^[0-9]+$')) {
      valid = false;
      hintText = max ? `Enter a number between 1 - ${max}` : 'Enter a number';
    } else {
      greatThanMax(value);
    }
  }

  function greatThanMax(value: string) {
    if (max && parseInt(value) > max) {
      valid = false;
      hintText = `Enter a number between 1 - ${max}`;
    } else {
      setValidAndClearHint();
    }
  }

  function setValidAndClearHint() {
    valid = true;
    hintText = '';
  }

  $: {
    if (value) {
      validateNumber(value);
    } else {
      setValidAndClearHint();
    }
  }
</script>

<div class={$$props.class}>
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <div class="flex items-center gap-2">
    <div class="input-container {theme}" class:disabled class:invalid={!valid}>
      <input
        class="m-2 block w-full bg-white text-center focus:outline-none"
        class:disabled
        {disabled}
        data-lpignore="true"
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
      />
    </div>
    <div class="units">{units}</div>
  </div>
</div>
{#if hintText}
  <span class="mt-1 text-xs text-red-700">{hintText}</span>
{/if}

<style lang="postcss">
  /* Base styles */
  label {
    @apply mb-10 font-secondary text-sm font-medium;
  }

  .units {
    @apply font-secondary text-sm font-medium;
  }

  .input-container {
    @apply relative box-border flex h-10 w-16 items-center rounded border border-gray-900 text-sm focus-within:border-blue-700;
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
