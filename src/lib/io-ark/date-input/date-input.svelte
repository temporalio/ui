<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { DateValue } from '@ark-ui/svelte/date-picker';

  export type DateInputGranularity = 'day' | 'hour' | 'minute' | 'second';

  export interface DateInputProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children'
  > {
    label: string;
    value?: DateValue;
    granularity?: DateInputGranularity;
    locale?: string;
    timeZone?: string;
    min?: DateValue;
    max?: DateValue;
    hourCycle?: 12 | 24;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    name?: string;
    class?: string;
    onValueChange?: (value: DateValue | undefined) => void;
  }
</script>

<script lang="ts">
  import {
    DateInput as ArkDateInput,
    type DateInputValueChangeDetails,
  } from '@ark-ui/svelte/date-input';

  import {
    dateInputControlRecipe,
    dateInputRecipe,
    dateInputSegmentGroupRecipe,
    dateInputSegmentRecipe,
  } from './recipe';
  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    fieldLabelRecipe,
    fieldRequiredIndicatorRecipe,
  } from '../field/recipe';

  const generatedId = $props.id();
  let {
    label,
    value = $bindable(),
    granularity = 'day',
    locale = 'en-US',
    timeZone,
    min,
    max,
    hourCycle,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    required = false,
    disabled = false,
    readOnly = false,
    id = generatedId,
    name,
    class: className,
    onValueChange,
    ...rest
  }: DateInputProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
  const helperTextId = $derived(`${id}-helper-text`);
  const errorTextId = $derived(`${id}-error-text`);
  const describedBy = $derived(
    [isInvalid && error && errorTextId, helperText && helperTextId]
      .filter(Boolean)
      .join(' ') || undefined,
  );
  const arkValue = $derived(value ? [value] : []);

  function handleValueChange(details: DateInputValueChangeDetails) {
    value = details.value[0];
    onValueChange?.(value);
  }
</script>

<ArkDateInput.Root
  {id}
  value={arkValue}
  {granularity}
  {locale}
  {timeZone}
  {min}
  {max}
  {hourCycle}
  {name}
  {required}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  onValueChange={handleValueChange}
  class={dateInputRecipe(className)}
  {...rest}
>
  <ArkDateInput.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </ArkDateInput.Label>
  <ArkDateInput.Control class={dateInputControlRecipe()}>
    <ArkDateInput.SegmentGroup
      class={dateInputSegmentGroupRecipe()}
      aria-describedby={describedBy}
      aria-invalid={isInvalid || undefined}
    >
      <ArkDateInput.SegmentContext>
        {#snippet render(segment)}
          <ArkDateInput.Segment {segment} class={dateInputSegmentRecipe()} />
        {/snippet}
      </ArkDateInput.SegmentContext>
    </ArkDateInput.SegmentGroup>
  </ArkDateInput.Control>
  <ArkDateInput.HiddenInput />
  {#if helperText}
    <p id={helperTextId} class={fieldHelperTextRecipe()}>{helperText}</p>
  {/if}
  {#if isInvalid && error}
    <p id={errorTextId} class={fieldErrorTextRecipe()} aria-live="polite">
      {error}
    </p>
  {/if}
</ArkDateInput.Root>
