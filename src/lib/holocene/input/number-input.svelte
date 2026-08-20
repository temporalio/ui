<script lang="ts">
  import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'class'> {
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
    icon,
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
      class={merge(
        'relative box-border flex h-10 min-w-16 items-center border border-io-border-tertiary bg-io-interactive-secondary text-sm text-io-content-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-io-interactive-primary',
        !disabled &&
          valid &&
          'focus-within:border-io-border-secondary hover:border-io-border-brand',
        disabled &&
          'border-io-border-secondary bg-io-surface-tertiary text-io-content-tertiary',
      )}
      class:search
      class:invalid={!valid}
    >
      {#if icon}
        <span class="icon-container">
          <Icon name={icon} />
        </span>
      {/if}
      <input
        class="m-2 block w-full bg-transparent text-center text-io-content-primary placeholder:text-io-content-tertiary focus:outline-none disabled:text-io-content-tertiary"
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
        class={merge(
          'flex h-10 items-center border-y border-r border-io-border-tertiary bg-io-surface-tertiary px-2 text-io-content-primary',
          disabled && 'border-io-border-secondary text-io-content-tertiary',
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
  class="text-xs text-io-content-danger"
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
    @apply border-io-border-danger focus-within:border-io-border-danger focus-within:ring-io-border-danger;
  }
</style>
