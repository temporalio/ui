<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { NumberInputValueChangeDetails } from '@ark-ui/svelte/number-input';

  export interface NumberInputProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    value?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    placeholder?: string;
    formatOptions?: Intl.NumberFormatOptions;
    allowMouseWheel?: boolean;
    clampValueOnBlur?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    name?: string;
    incrementLabel?: string;
    decrementLabel?: string;
    onValueChange?: (details: NumberInputValueChangeDetails) => void;
    class?: string;
  }
</script>

<script lang="ts">
  import { NumberInput as ArkNumberInput } from '@ark-ui/svelte/number-input';

  import { IconChevronDown, IconChevronUp } from '$lib/io/icon';
  import { Field } from '$lib/io-ark/field';

  import {
    numberInputControlRecipe,
    numberInputInputRecipe,
    numberInputTriggerGroupRecipe,
    numberInputTriggerRecipe,
    numberInputUnitRecipe,
  } from './recipe';

  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    value = $bindable(''),
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    unit = '',
    placeholder,
    formatOptions,
    allowMouseWheel = false,
    clampValueOnBlur = true,
    required = false,
    disabled = false,
    readOnly = false,
    id,
    name,
    incrementLabel = 'Increase value',
    decrementLabel = 'Decrease value',
    onValueChange,
    class: className,
    ...rest
  }: NumberInputProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
</script>

<Field
  {label}
  {labelHidden}
  {helperText}
  {error}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  {id}
  class={className}
  {...rest}
>
  <ArkNumberInput.Root
    bind:value
    {min}
    {max}
    {step}
    {name}
    {formatOptions}
    {allowMouseWheel}
    {clampValueOnBlur}
    {required}
    {disabled}
    {readOnly}
    invalid={isInvalid}
    translations={{
      incrementLabel,
      decrementLabel,
    }}
    {onValueChange}
  >
    <ArkNumberInput.Control class={numberInputControlRecipe()}>
      <ArkNumberInput.Input {placeholder} class={numberInputInputRecipe()} />
      {#if unit}
        <span aria-hidden="true" class={numberInputUnitRecipe()}>{unit}</span>
      {/if}
      <div class={numberInputTriggerGroupRecipe()}>
        <ArkNumberInput.IncrementTrigger class={numberInputTriggerRecipe()}>
          <IconChevronUp width={12} height={12} />
        </ArkNumberInput.IncrementTrigger>
        <ArkNumberInput.DecrementTrigger class={numberInputTriggerRecipe()}>
          <IconChevronDown width={12} height={12} />
        </ArkNumberInput.DecrementTrigger>
      </div>
    </ArkNumberInput.Control>
  </ArkNumberInput.Root>
</Field>
