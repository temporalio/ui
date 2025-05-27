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
  export let step: number = 1;
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
      class="surface-primary relative box-border flex h-10 min-w-16 items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70"
      class:opacity-50={disabled}
      class:search
      class:invalid={!valid}
    >
      {#if icon}
        <span class="icon-container">
          <Icon name={icon} />
        </span>
      {/if}
      <input
        class="m-2 block w-full bg-transparent text-center text-primary focus:outline-none"
        type="number"
        {max}
        {min}
        {disabled}
        data-lpignore="true"
        data-1p-ignore="true"
        {placeholder}
        {id}
        {name}
        {step}
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

  .search {
    @apply w-fit;

    input {
      @apply text-left;
    }
  }

  .icon-container {
    @apply ml-2 flex items-center justify-center;
  }

  .invalid {
    @apply border-danger focus-within:ring-danger/70;
  }
</style>
