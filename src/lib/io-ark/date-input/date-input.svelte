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
  import { useFieldsetContext } from '@ark-ui/svelte/fieldset';

  import {
    fieldLabelRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-ark/field';

  import {
    dateInputControlRecipe,
    dateInputRecipe,
    dateInputSegmentGroupRecipe,
    dateInputSegmentRecipe,
  } from './recipe';

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

  const fieldset = useFieldsetContext();
  const isDisabled = $derived(disabled || !!fieldset?.().disabled);
  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(!!(isInvalid && error));
  const messageIds = $derived(
    getFieldMessageIds(id, { helperText, showError, errorFirst: true }),
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
  disabled={isDisabled}
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
      aria-describedby={messageIds.describedBy}
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
  <FieldMessages ids={messageIds} {helperText} {error} {showError} />
</ArkDateInput.Root>
