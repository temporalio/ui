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
      class="input-container"
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
        class="m-2 block w-full bg-transparent text-center text-primary focus:outline-none"
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
    @apply mb-10 font-secondary text-sm font-medium text-primary;
  }

  .units {
    @apply font-secondary text-sm font-medium text-primary;
  }

  .input-container {
    @apply relative box-border flex h-10 w-16 items-center rounded border-2 text-sm focus-within:border-information dark:border-subtle;
  }

  .input-container.search {
    @apply w-fit;

    input {
      @apply text-left;
    }
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
    @apply invisible mr-2 font-secondary text-sm font-medium;
  }

  .input-container .icon-container {
    @apply text-slate-400;
  }

  .input-container.disabled {
    @apply border border-slate-600 bg-slate-50  text-slate-600;
  }

  .input-container.disabled input {
    @apply bg-slate-50;
  }

  .input-container.disabled .copy-icon-container {
    @apply border-slate-600 bg-slate-200;
  }

  .unroundRight {
    @apply rounded-br-none rounded-tr-none;
  }

  .unroundLeft {
    @apply rounded-bl-none rounded-tl-none;
  }
</style>
