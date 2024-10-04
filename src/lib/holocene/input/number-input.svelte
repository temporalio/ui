<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';

  export let icon: IconName = null;
  export let id: string;
  export let value: number;
  export let label: string;
  export let labelHidden = false;
  export let units = '';
  export let placeholder = '';
  export let name = id;
  export let disabled = false;
  export let required = false;
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

<div class={merge('flex flex-col gap-1', $$props.class)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
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
        data-1p-ignore="true"
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
  <span class="mt-1 text-xs text-danger">{hintText}</span>
{/if}

<style lang="postcss">
  .units {
    @apply text-sm font-medium text-primary;
  }

  .input-container {
    @apply surface-primary relative box-border flex h-10 w-16 items-center rounded-lg border-2 border-subtle text-sm focus-within:outline-none focus-within:ring-4 focus-within:ring-primary/70;
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

  .input-container.invalid {
    @apply border-danger focus-within:ring-danger/70;
  }

  .input-container.disabled {
    @apply opacity-50;
  }

  .unroundRight {
    @apply rounded-br-none rounded-tr-none;
  }

  .unroundLeft {
    @apply rounded-bl-none rounded-tl-none border-l-0;
  }
</style>
