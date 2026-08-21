<script lang="ts">
  import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Label from '$lib/holocene/label.svelte';
  import { type IconComponent } from '$lib/io/icon';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'class'> {
    Icon?: IconComponent;
    id: string;
    value: number;
    label: string;
    labelHidden?: boolean;
    units?: string;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    hintText?: string;
    max?: number;
    min?: number;
    step?: number;
    search?: boolean;
    autocomplete?: FullAutoFill;
    class?: string;
  }

  let {
    Icon,
    id,
    value = $bindable(),
    label,
    labelHidden = false,
    units = '',
    placeholder = '',
    name,
    disabled = false,
    required = false,
    invalid = false,
    hintText = '',
    max,
    min,
    step = 1,
    search = false,
    autocomplete = 'off',
    class: className,
    ...rest
  }: Props = $props();

  const resolvedName = $derived(name ?? id);
  const valid = $derived(
    !invalid &&
      !(
        (min !== undefined && value < min) ||
        (max !== undefined && value > max)
      ),
  );
  const errorId = $derived(`${id}-error`);
</script>

<div class={merge('flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
  <div class="flex items-center">
    <div
      class="surface-primary relative box-border flex h-10 min-w-16 items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70"
      class:opacity-50={disabled}
      class:search
      class:invalid={!valid}
    >
      {#if Icon}
        <span class="icon-container">
          <Icon />
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
        name={resolvedName}
        {step}
        {required}
        aria-invalid={!valid ? 'true' : undefined}
        aria-describedby={!valid && hintText ? errorId : undefined}
        {autocomplete}
        spellcheck="false"
        bind:value
        {...rest}
      />
    </div>
    {#if units}
      <div
        class="flex h-10 items-center border-y border-r border-subtle bg-subtle px-2"
      >
        <p class="text-sm font-normal text-primary">{units}</p>
      </div>
    {/if}
  </div>
</div>
<span
  id={errorId}
  role="alert"
  class="text-xs text-danger"
  class:mt-1={!valid && !!hintText}
>
  {#if !valid && hintText}{hintText}{/if}
</span>

<style lang="postcss">
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
