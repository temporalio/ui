<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/anthropocene/icon';
  import Icon from '$lib/anthropocene/icon/icon.svelte';
  import Label from '$lib/anthropocene/label.svelte';

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
    step?: number;
    search?: boolean;
    class?: string;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
    onkeydown?: (event: KeyboardEvent) => void;
  }

  let {
    icon = null,
    id,
    value = $bindable(0),
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
    step = 1,
    search = false,
    class: className,
    oninput,
    onchange,
    onfocus,
    onblur,
    onkeydown,
  }: Props = $props();

  let valid = true;

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
        class="m-2 block w-full bg-transparent text-center text-primary focus:text-brand focus:outline-none"
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
        {oninput}
        {onchange}
        {onfocus}
        {onblur}
        {onkeydown}
      />
    </div>
    {#if units}
      <div class="units">{units}</div>
    {/if}
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
