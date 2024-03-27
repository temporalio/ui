<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  export let icon: IconName = null;
  export let id: string;
  export let value: number;
  export let label: string;
  export let labelHidden = false;
  export let units = '';
  export let placeholder = '';
  export let name = id;
  export let disabled = false;
  export let theme: 'dark' | 'light' = 'light';
  export let hintText = '';
  export let max: number = undefined;
  export let min: number = undefined;
  export let unroundRight = false;
  export let unroundLeft = false;
  export let search = false;

  let valid = true;

  const validate = (val: number) => {
    if ((min !== undefined && val < min) || (max !== undefined && val > max)) {
      valid = false;
    } else {
      valid = true;
    }
  };

  $: {
    validate(value);
  }
</script>

<div class={$$props.class}>
  <label class:sr-only={labelHidden} for={id}>{label}</label>
  <div class="flex items-center gap-2">
    <div
      class="input-container {theme}"
      class:disabled
      class:search
      class:unroundRight
      class:unroundLeft
      class:invalid={!valid}
    >
      {#if icon}
        <span class="icon-container">
          <Icon name={icon} />
        </span>
      {/if}
      <input
        class="surface-primary m-2 block w-full text-center focus:outline-none"
        class:disabled
        type="number"
        {max}
        {min}
        {disabled}
        data-lpignore="true"
        {placeholder}
        {id}
        {name}
        autocomplete="off"
        spellcheck="false"
        bind:value
        on:input
        on:change
        on:focus
        on:blur
        on:keydown
      />
    </div>
    <div class="units">{units}</div>
  </div>
</div>
{#if !valid && hintText}
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
    @apply relative box-border flex h-10 w-16 items-center rounded border  text-sm focus-within:border-blue-700;
  }

  .input-container.search {
    @apply w-fit;

    input {
      @apply text-left;
    }
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
    @apply surface-primary;
  }

  .input-container.light .icon-container {
    @apply text-slate-400;
  }

  .input-container.light.disabled {
    @apply border-slate-600 bg-slate-50  text-slate-600;
  }

  .input-container.light.disabled input {
    @apply bg-slate-50;
  }

  .input-container.light.disabled .copy-icon-container {
    @apply border-slate-600 bg-slate-200;
  }

  /* Dark theme styles */
  .input-container.dark,
  .input-container.dark .icon-container,
  .input-container.dark input,
  .input-container.dark .copy-icon-container {
    @apply bg-inverse text-white;
  }

  .input-container.dark input {
    @apply placeholder:text-slate-200;
  }

  .input-container.dark.disabled,
  .input-container.dark.disabled .copy-icon-container,
  .input-container.dark.disabled input {
    @apply bg-inverse;
  }

  .unroundRight {
    @apply rounded-br-none rounded-tr-none;
  }

  .unroundLeft {
    @apply rounded-bl-none rounded-tl-none;
  }
</style>
