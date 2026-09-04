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
    readonly = false,
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
      class={merge(
        'relative box-border flex h-10 min-w-16 items-center rounded border border-primary bg-background-primary text-sm text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive-primary focus-within:ring-offset-2 focus-within:ring-offset-background-primary',
        units && 'rounded-r-none',
        !disabled &&
          !readonly &&
          valid &&
          'focus-within:border-secondary hover:border-brand',
        readonly &&
          !disabled &&
          'border-primary bg-surface-primary hover:border-primary',
        disabled && 'border-secondary bg-surface-tertiary text-tertiary',
      )}
      class:search
      class:invalid={!valid}
    >
      {#if Icon}
        <span class="icon-container">
          <Icon />
        </span>
      {/if}
      <input
        class="m-2 block w-full bg-transparent text-center text-primary placeholder:text-tertiary focus:outline-none focus:ring-0 disabled:text-tertiary"
        type="number"
        {max}
        {min}
        {disabled}
        {readonly}
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
        class={merge(
          'flex h-10 items-center rounded-r border-y border-r border-primary bg-surface-tertiary px-2 text-primary',
          disabled && 'border-secondary text-tertiary',
        )}
      >
        <p class="text-sm font-normal">{units}</p>
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
    @apply border-danger focus-within:border-danger;

    box-shadow: inset 0 0 0 1px var(--color-border-primary);
  }
</style>
