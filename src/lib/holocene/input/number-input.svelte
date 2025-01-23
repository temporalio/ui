<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';

  interface Props {
    icon?: IconName;
    id: string;
    value: number;
    label: string;
    labelHidden?: boolean;
    units?: string;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    hintText?: string;
    max?: number;
    min?: number;
    search?: boolean;
    class?: string;
  }

  let {
    icon = null,
    id,
    value,
    label,
    labelHidden = false,
    units = '',
    placeholder = '',
    name = id,
    disabled = false,
    required = false,
    hintText = '',
    max,
    min,
    search = false,
    class: className = '',
    ...rest
  }: Props = $props();

  let valid = $state(true);

  const validate = (val: number) => {
    if ((min !== undefined && val < min) || (max !== undefined && val > max)) {
      valid = false;
    } else {
      valid = true;
    }
  };

  $effect(() => {
    validate(value);
  });
</script>

<div class={merge('flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
  <div class="flex items-center gap-2">
    <div
      class="surface-primary relative box-border flex h-10 w-16 items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70"
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
        autocomplete="off"
        spellcheck="false"
        bind:value
        {...rest}
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
