<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    DatePickerSelectionMode,
    DateValue,
  } from '@ark-ui/svelte/date-picker';

  export interface DatePickerProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'placeholder'
  > {
    label: string;
    value?: DateValue[];
    open?: boolean;
    selectionMode?: Exclude<DatePickerSelectionMode, 'multiple'>;
    min?: DateValue;
    max?: DateValue;
    isDateUnavailable?: (date: DateValue, locale: string) => boolean;
    locale?: string;
    timeZone?: string;
    placeholder?: string;
    closeOnSelect?: boolean;
    inline?: boolean;
    portalled?: boolean;
    fixedWeeks?: boolean;
    startOfWeek?: number;
    showToday?: boolean;
    todayLabel?: string;
    triggerLabel?: string;
    clearLabel?: string;
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
    onValueChange?: (value: DateValue[]) => void;
  }
</script>

<script lang="ts">
  import {
    DatePicker as ArkDatePicker,
    type DatePickerValueChangeDetails,
    parseDate,
  } from '@ark-ui/svelte/date-picker';
  import { Portal } from '@ark-ui/svelte/portal';

  import {
    IconCalendar,
    IconChevronLeft,
    IconChevronRight,
    IconClose,
  } from '$lib/io/icon';

  import {
    datePickerCellTriggerRecipe,
    datePickerContentRecipe,
    datePickerControlRecipe,
    datePickerFooterRecipe,
    datePickerIconButtonRecipe,
    datePickerInputRecipe,
    datePickerPresetRecipe,
    datePickerRecipe,
    datePickerTableHeaderRecipe,
    datePickerTableRecipe,
    datePickerViewControlRecipe,
    datePickerViewTriggerRecipe,
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
    value = $bindable([]),
    open = $bindable(false),
    selectionMode = 'single',
    min,
    max,
    isDateUnavailable,
    locale = 'en-US',
    timeZone,
    placeholder,
    closeOnSelect = true,
    inline = false,
    portalled = true,
    fixedWeeks = true,
    startOfWeek,
    showToday = true,
    todayLabel = 'Today',
    triggerLabel = 'Open calendar',
    clearLabel = 'Clear date',
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
  }: DatePickerProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
  const isRange = $derived(selectionMode === 'range');
  const helperTextId = $derived(`${id}-helper-text`);
  const errorTextId = $derived(`${id}-error-text`);
  const describedBy = $derived(
    [isInvalid && error && errorTextId, helperText && helperTextId]
      .filter(Boolean)
      .join(' ') || undefined,
  );
  const inputPlaceholder = $derived(
    placeholder ?? (isRange ? 'Start date' : 'Select a date'),
  );

  function handleValueChange(details: DatePickerValueChangeDetails) {
    value = details.value;
    onValueChange?.(details.value);
  }
</script>

{#snippet viewControl()}
  <ArkDatePicker.ViewControl class={datePickerViewControlRecipe()}>
    <ArkDatePicker.PrevTrigger class={datePickerIconButtonRecipe()}>
      <IconChevronLeft width={16} height={16} />
    </ArkDatePicker.PrevTrigger>
    <ArkDatePicker.ViewTrigger class={datePickerViewTriggerRecipe()}>
      <ArkDatePicker.RangeText />
    </ArkDatePicker.ViewTrigger>
    <ArkDatePicker.NextTrigger class={datePickerIconButtonRecipe()}>
      <IconChevronRight width={16} height={16} />
    </ArkDatePicker.NextTrigger>
  </ArkDatePicker.ViewControl>
{/snippet}

{#snippet calendar()}
  <ArkDatePicker.Content class={datePickerContentRecipe()}>
    <ArkDatePicker.View
      view="day"
      class="flex flex-col gap-2 [&[hidden]]:hidden"
    >
      <ArkDatePicker.Context>
        {#snippet render(datePicker)}
          {@render viewControl()}
          <ArkDatePicker.Table class={datePickerTableRecipe()}>
            <ArkDatePicker.TableHead>
              <ArkDatePicker.TableRow>
                {#each datePicker().weekDays as weekDay, index (index)}
                  <ArkDatePicker.TableHeader
                    class={datePickerTableHeaderRecipe()}
                    abbr={weekDay.long}
                    >{weekDay.narrow}</ArkDatePicker.TableHeader
                  >
                {/each}
              </ArkDatePicker.TableRow>
            </ArkDatePicker.TableHead>
            <ArkDatePicker.TableBody>
              {#each datePicker().weeks as week, weekIndex (weekIndex)}
                <ArkDatePicker.TableRow>
                  {#each week as day (day.toString())}
                    <ArkDatePicker.TableCell value={day} class="p-0">
                      <ArkDatePicker.TableCellTrigger
                        class={datePickerCellTriggerRecipe()}
                        >{day.day}</ArkDatePicker.TableCellTrigger
                      >
                    </ArkDatePicker.TableCell>
                  {/each}
                </ArkDatePicker.TableRow>
              {/each}
            </ArkDatePicker.TableBody>
          </ArkDatePicker.Table>
        {/snippet}
      </ArkDatePicker.Context>
    </ArkDatePicker.View>
    <ArkDatePicker.View
      view="month"
      class="flex flex-col gap-2 [&[hidden]]:hidden"
    >
      <ArkDatePicker.Context>
        {#snippet render(datePicker)}
          {@render viewControl()}
          <ArkDatePicker.Table class={datePickerTableRecipe()}>
            <ArkDatePicker.TableBody>
              {#each datePicker().getMonthsGrid( { columns: 4, format: 'short' }, ) as months, rowIndex (rowIndex)}
                <ArkDatePicker.TableRow>
                  {#each months as month (month.value)}
                    <ArkDatePicker.TableCell value={month.value} class="p-0">
                      <ArkDatePicker.TableCellTrigger
                        class={datePickerCellTriggerRecipe({
                          view: 'month',
                        })}>{month.label}</ArkDatePicker.TableCellTrigger
                      >
                    </ArkDatePicker.TableCell>
                  {/each}
                </ArkDatePicker.TableRow>
              {/each}
            </ArkDatePicker.TableBody>
          </ArkDatePicker.Table>
        {/snippet}
      </ArkDatePicker.Context>
    </ArkDatePicker.View>
    <ArkDatePicker.View
      view="year"
      class="flex flex-col gap-2 [&[hidden]]:hidden"
    >
      <ArkDatePicker.Context>
        {#snippet render(datePicker)}
          {@render viewControl()}
          <ArkDatePicker.Table class={datePickerTableRecipe()}>
            <ArkDatePicker.TableBody>
              {#each datePicker().getYearsGrid( { columns: 4 }, ) as years, rowIndex (rowIndex)}
                <ArkDatePicker.TableRow>
                  {#each years as year (year.value)}
                    <ArkDatePicker.TableCell value={year.value} class="p-0">
                      <ArkDatePicker.TableCellTrigger
                        class={datePickerCellTriggerRecipe({
                          view: 'year',
                        })}>{year.label}</ArkDatePicker.TableCellTrigger
                      >
                    </ArkDatePicker.TableCell>
                  {/each}
                </ArkDatePicker.TableRow>
              {/each}
            </ArkDatePicker.TableBody>
          </ArkDatePicker.Table>
        {/snippet}
      </ArkDatePicker.Context>
    </ArkDatePicker.View>
    {#if showToday && !isRange}
      <div class={datePickerFooterRecipe()}>
        <ArkDatePicker.PresetTrigger
          value={[parseDate(new Date())]}
          class={datePickerPresetRecipe()}
          >{todayLabel}</ArkDatePicker.PresetTrigger
        >
      </div>
    {/if}
  </ArkDatePicker.Content>
{/snippet}

<ArkDatePicker.Root
  {id}
  {value}
  bind:open
  {selectionMode}
  {min}
  {max}
  {isDateUnavailable}
  {locale}
  {timeZone}
  {closeOnSelect}
  {inline}
  {fixedWeeks}
  {startOfWeek}
  {name}
  {required}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  onValueChange={handleValueChange}
  class={datePickerRecipe(className)}
  {...rest}
>
  <ArkDatePicker.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </ArkDatePicker.Label>
  <ArkDatePicker.Control class={datePickerControlRecipe()}>
    <ArkDatePicker.Input
      index={0}
      placeholder={inputPlaceholder}
      aria-describedby={describedBy}
      class={datePickerInputRecipe()}
    />
    {#if isRange}
      <span aria-hidden="true" class="text-secondary">–</span>
      <ArkDatePicker.Input
        index={1}
        placeholder="End date"
        aria-describedby={describedBy}
        class={datePickerInputRecipe()}
      />
    {/if}
    {#if value.length && !disabled && !readOnly}
      <ArkDatePicker.ClearTrigger
        aria-label={clearLabel}
        class={datePickerIconButtonRecipe()}
      >
        <IconClose width={16} height={16} />
      </ArkDatePicker.ClearTrigger>
    {/if}
    <ArkDatePicker.Trigger
      aria-label={triggerLabel}
      class={datePickerIconButtonRecipe()}
    >
      <IconCalendar width={16} height={16} />
    </ArkDatePicker.Trigger>
  </ArkDatePicker.Control>
  {#if helperText}
    <p id={helperTextId} class={fieldHelperTextRecipe()}>{helperText}</p>
  {/if}
  {#if isInvalid && error}
    <p id={errorTextId} class={fieldErrorTextRecipe()} aria-live="polite">
      {error}
    </p>
  {/if}
  {#if inline}
    {@render calendar()}
  {:else}
    <Portal disabled={!portalled}>
      <ArkDatePicker.Positioner class="z-50">
        {@render calendar()}
      </ArkDatePicker.Positioner>
    </Portal>
  {/if}
</ArkDatePicker.Root>
