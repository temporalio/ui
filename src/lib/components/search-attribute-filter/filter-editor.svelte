<script lang="ts">
  import { get, writable } from 'svelte/store';

  import { addHours, addMinutes, addSeconds, startOfDay } from 'date-fns';
  import { zonedTimeToUtc } from 'date-fns-tz';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconClock, IconTrash } from '$lib/io/icon';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { prefixSearchEnabled } from '$lib/stores/capability-enablement';
  import {
    endDate,
    endHour,
    endMinute,
    endSecond,
    relativeTimeDuration,
    relativeTimeUnit,
    startDate,
    startHour,
    startMinute,
    startSecond,
    timeFormat,
    timeFormatType,
  } from '$lib/stores/time-format';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { getSelectedTimezone } from '$lib/utilities/format-date';
  import { isInConditional, isNullConditional } from '$lib/utilities/is';
  import { getInitialDateTimes } from '$lib/utilities/query/datetime-filter-parse';
  import {
    formatListFilterValue,
    isBooleanFilter,
    isDateTimeFilter,
    isDurationFilter,
    isListFilter,
    isNumberFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';
  import { getTimezone, TIME_UNIT_OPTIONS } from '$lib/utilities/timezone';
  import { toDate } from '$lib/utilities/to-duration';

  type Props = {
    filter: SearchAttributeFilter;
    // Namespaces the input ids. Two editors can be open at once — a chip in the
    // filter bar and a popup on a table cell — so these cannot be global.
    idPrefix: string;
    onApply: (filter: SearchAttributeFilter) => void;
    onRemove?: () => void;
    // A cell popup is seeded with that row's own timestamp, so it has to start
    // in absolute mode: relative mode recomputes the value from the duration
    // inputs on apply and would throw the seeded value away.
    defaultTimeMode?: 'relative' | 'absolute';
    // A popover opens without moving focus, so Enter cannot reach the form on
    // its own.
    applyOnEnter?: boolean;
  };

  let {
    filter,
    idPrefix,
    onApply,
    onRemove,
    defaultTimeMode,
    applyOnEnter = false,
  }: Props = $props();

  let formElement = $state<HTMLFormElement | null>(null);

  let localFilter = $state({ ...filter });

  // Local so the radios do not rewrite the persisted preference until applied.
  const timeMode = writable(defaultTimeMode ?? get(timeFormatType));

  const timezone = $derived(getTimezone($timeFormat ?? 'UTC'));

  let { start, end } = $state(getInitialDateTimes(filter, timezone));

  // The date and time pickers only carry seconds, so recomputing the value from
  // them would round off a seeded timestamp. Keep what we were given unless the
  // controls were actually touched.
  const seededTimes = JSON.stringify(getInitialDateTimes(filter, timezone));
  const timesUntouched = () => JSON.stringify({ start, end }) === seededTimes;

  let chips = $derived(formatListFilterValue(localFilter.value));
  const isNullFilter = $derived(isNullConditional(localFilter.conditional));
  const isTimeRange = $derived(localFilter.conditional === 'BETWEEN');
  const selectedTime = $derived(getSelectedTimezone($timeFormat));

  const defaultConditionOptions = [
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];

  const conditionalOptions = $derived([
    { value: '=', label: translate('common.equal-to'), id: 'equal-to' },
    {
      value: '!=',
      label: translate('common.not-equal-to'),
      id: 'not-equal-to',
    },
    ...($prefixSearchEnabled && filter.type === SEARCH_ATTRIBUTE_TYPE.KEYWORD
      ? [
          {
            value: 'STARTS_WITH',
            label: translate('common.starts-with'),
            id: 'starts-with',
          },
        ]
      : []),
    ...defaultConditionOptions,
  ]);

  const dateConditionalOptions = $derived([
    { value: '<=', label: translate('common.before') },
    { value: 'BETWEEN', label: translate('common.between') },
    { value: '>=', label: translate('common.after') },
    ...defaultConditionOptions,
  ]);

  const numberConditionalOptions = $derived([
    { value: '>', label: '>', id: 'greater-than' },
    {
      value: '>=',
      label: '>=',
      id: 'greater-than-equal',
    },
    {
      value: '=',
      label: '=',
      id: 'equal-to',
    },
    {
      value: '!=',
      label: '!=',
      id: 'not-equal-to',
    },
    {
      value: '<=',
      label: '<=',
      id: 'less-than-equal',
    },
    { value: '<', label: '<', id: 'less-than' },
    ...defaultConditionOptions,
  ]);

  const listConditionalOptions = $derived([
    { value: 'in', label: translate('common.in') },
    { value: 'not in', label: translate('common.not-in') },
    { value: '=', label: translate('common.equal-to') },
    { value: '!=', label: translate('common.not-equal-to') },
    ...defaultConditionOptions,
  ]);

  function applyChanges(e: SubmitEvent) {
    e.preventDefault();

    if (isInConditional(localFilter.conditional)) {
      localFilter.value = `(${chips.map((item) => `"${item}"`).join(', ')})`;
    } else if (isDateTimeFilter(localFilter)) {
      onTimeApply();
      timeFormatType.set($timeMode);
    }
    onApply(localFilter);
  }

  $effect(() => {
    if (!applyOnEnter) return;

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing) return;

      const target = e.target;
      if (!(target instanceof Element)) return;

      // Only the form and the button that opened it. Anything else with focus —
      // the Copy button beside the trigger, say — keeps its own Enter.
      const isInsideForm = formElement?.contains(target) ?? false;
      const isOpeningTrigger =
        target
          .closest('[data-menu-anchor]')
          ?.getAttribute('data-menu-anchor') === idPrefix;
      if (!isInsideForm && !isOpeningTrigger) return;

      // A button in the form already does something with Enter: a toggle flips,
      // Apply submits.
      if (target instanceof HTMLButtonElement && isInsideForm) return;

      // The chip input claims Enter to commit a keyword.
      if (
        target instanceof HTMLInputElement &&
        target.id === `${idPrefix}-list-filter` &&
        target.value !== ''
      ) {
        return;
      }

      e.preventDefault();
      formElement?.requestSubmit();
    };

    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  });

  function timeError(x: string) {
    if (x) return isNaN(Number(x)) || isNaN(parseFloat(x));
    return false;
  }

  const onStartDateChange = (d: Date) => {
    start.date = startOfDay(d);
  };

  const onEndDateChange = (d: Date) => {
    end.date = startOfDay(d);
  };

  const applyTimeChanges = (
    date: Date,
    time: { hour?: string; minute?: string; second?: string },
  ) => {
    let _date = new Date(date);
    if (time.hour) _date = addHours(_date, parseInt(time.hour));
    if (time.minute) _date = addMinutes(_date, parseInt(time.minute));
    if (time.second) _date = addSeconds(_date, parseInt(time.second));

    return _date;
  };

  const onTimeApply = () => {
    if (isNullFilter) return;
    if ($timeMode === 'relative' && !isTimeRange) {
      if (!$relativeTimeDuration) return;
      localFilter.value = toDate(
        `${$relativeTimeDuration} ${$relativeTimeUnit}`,
      );
      localFilter.customDate = false;
    } else {
      if (
        timesUntouched() &&
        !isTimeRange &&
        filter.value &&
        !filter.customDate
      ) {
        localFilter.value = filter.value;
        localFilter.customDate = false;
        return;
      }

      let startDateWithTime = applyTimeChanges(start.date, {
        hour: start.hour,
        minute: start.minute,
        second: start.second,
      });
      let endDateWithTime = applyTimeChanges(end.date, {
        hour: end.hour,
        minute: end.minute,
        second: end.second,
      });

      const timezone = getTimezone($timeFormat ?? 'UTC');
      const formattedStartTime = zonedTimeToUtc(
        startDateWithTime,
        timezone,
      ).toISOString();

      const formattedEndTime = zonedTimeToUtc(
        endDateWithTime,
        timezone,
      ).toISOString();

      const value = isTimeRange
        ? `BETWEEN "${formattedStartTime}" AND "${formattedEndTime}"`
        : formattedStartTime;

      localFilter.value = value;

      if (isTimeRange) {
        localFilter.customDate = true;
        localFilter.conditional = 'BETWEEN';
      } else {
        localFilter.customDate = false;
      }

      // Update global stores so next filter gets these as defaults
      startDate.set(start.date);
      startHour.set(start.hour);
      startMinute.set(start.minute);
      startSecond.set(start.second);

      endDate.set(end.date);
      endHour.set(end.hour);
      endMinute.set(end.minute);
      endSecond.set(end.second);
    }
  };
</script>

{#snippet conditionalButtons(options: { value: string; label: string }[])}
  <ToggleButtons>
    {#each options as option (option.value)}
      <ToggleButton
        variant="secondary"
        active={localFilter.conditional === option.value}
        onclick={() => {
          if (isNullConditional(option.value)) {
            localFilter.value = '';
          } else if (isNullFilter) {
            localFilter.value = filter.value;
          }
          localFilter.conditional = option.value;
        }}
        size="xs">{option.label}</ToggleButton
      >
    {/each}
  </ToggleButtons>
{/snippet}

<form bind:this={formElement} onsubmit={applyChanges}>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium">Filter by {filter.attribute}</h3>
    </div>
    {#if isTextFilter(localFilter)}
      <div class="space-y-3">
        {@render conditionalButtons(conditionalOptions)}
        <Input
          id={`${idPrefix}-text`}
          label="Value"
          placeholder="Enter value..."
          disabled={isNullFilter}
          bind:value={localFilter.value}
        />
      </div>
    {:else if isDateTimeFilter(localFilter)}
      <div class="space-y-3 lg:min-w-[360px]">
        {@render conditionalButtons(dateConditionalOptions)}
        {#if isTimeRange}
          <div class="flex flex-col gap-2">
            <DatePicker
              label={translate('common.start')}
              onDateChange={onStartDateChange}
              selected={new Date(start.date)}
              todayLabel={translate('common.today')}
              closeLabel={translate('common.close')}
              clearLabel={translate('common.clear-input-button-label')}
            />
            <TimePicker
              class="flex-col sm:flex-row"
              bind:hour={start.hour}
              bind:minute={start.minute}
              bind:second={start.second}
              twelveHourClock={false}
            />
          </div>
          <div class="flex flex-col gap-2">
            <DatePicker
              label={translate('common.end')}
              onDateChange={onEndDateChange}
              selected={new Date(end.date)}
              todayLabel={translate('common.today')}
              closeLabel={translate('common.close')}
              clearLabel={translate('common.clear-input-button-label')}
            />
            <TimePicker
              class="flex-col sm:flex-row"
              bind:hour={end.hour}
              bind:minute={end.minute}
              bind:second={end.second}
              twelveHourClock={false}
            />
          </div>
        {:else}
          <div class="flex flex-col">
            <RadioInput
              label={translate('common.relative')}
              id="{idPrefix}-relative-time"
              value="relative"
              name="{idPrefix}-time-filter-type"
              group={timeMode}
              disabled={isNullFilter}
            />
            <div class="ml-6 flex gap-2 pt-2">
              <Input
                label={translate('common.relative')}
                labelHidden
                id="{idPrefix}-relative-datetime-input"
                bind:value={$relativeTimeDuration}
                placeholder="00"
                error={timeError($relativeTimeDuration)}
                class="h-10"
                disabled={$timeMode !== 'relative' || isNullFilter}
              />
              <Select
                bind:value={$relativeTimeUnit}
                id="{idPrefix}-relative-datetime-unit-input"
                label={translate('common.time-unit')}
                labelHidden
                disabled={$timeMode !== 'relative' || isNullFilter}
              >
                {#each TIME_UNIT_OPTIONS as unit (unit)}
                  <Option value={unit}>{unit} {translate('common.ago')}</Option>
                {/each}
              </Select>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <RadioInput
              label={translate('common.absolute')}
              id="{idPrefix}-absolute-time"
              value="absolute"
              name="{idPrefix}-time-filter-type"
              group={timeMode}
              disabled={isNullFilter}
            />
            <div class="ml-6 flex flex-col gap-2">
              <DatePicker
                label={translate('common.start')}
                labelHidden
                onDateChange={onStartDateChange}
                selected={new Date(start.date)}
                todayLabel={translate('common.today')}
                closeLabel={translate('common.close')}
                clearLabel={translate('common.clear-input-button-label')}
                disabled={$timeMode !== 'absolute' || isNullFilter}
              />
              <TimePicker
                class="flex-col sm:flex-row"
                bind:hour={start.hour}
                bind:minute={start.minute}
                bind:second={start.second}
                twelveHourClock={false}
                disabled={$timeMode !== 'absolute'}
              />
            </div>
          </div>
        {/if}
        <p class="flex items-center justify-end gap-1 text-sm text-secondary">
          <IconClock />
          {translate('common.based-on-time-preface')}
          {selectedTime}
        </p>
      </div>
    {:else if isNumberFilter(localFilter)}
      <div class="space-y-3">
        {@render conditionalButtons(numberConditionalOptions)}
        <Input
          id={`${idPrefix}-number`}
          label="Value"
          placeholder={isDurationFilter(localFilter)
            ? translate('workflows.duration-filter-placeholder')
            : translate('common.number-input-placeholder')}
          disabled={isNullFilter}
          bind:value={localFilter.value}
        />
      </div>
    {:else if isListFilter(localFilter)}
      <div class="space-y-2">
        {@render conditionalButtons(listConditionalOptions)}
        {#if isInConditional(localFilter.conditional)}
          <ChipInput
            label={localFilter.attribute}
            labelHidden
            id="{idPrefix}-list-filter"
            bind:chips
            class="w-full"
            removeChipButtonLabel={(chip) =>
              translate('workflows.remove-keyword-label', {
                keyword: chip,
              })}
            placeholder="{translate('common.enter')} {localFilter.attribute}"
            external
          />
        {:else}
          <Input
            label={localFilter.attribute}
            labelHidden
            id="{idPrefix}-list-filter"
            type="search"
            placeholder={`${translate('common.enter')} ${localFilter.attribute}`}
            class="w-full"
            disabled={isNullFilter}
            bind:value={localFilter.value}
          />
        {/if}
      </div>
    {:else if isBooleanFilter(localFilter)}
      <div class="space-y-2">
        <ToggleButtons>
          <ToggleButton
            variant={localFilter.value === 'true' ? 'primary' : 'secondary'}
            onclick={() => {
              localFilter.conditional = '=';
              localFilter.value = 'true';
            }}
            active={localFilter.value === 'true'}
            size="xs">True</ToggleButton
          >
          <ToggleButton
            variant={localFilter.value === 'false' ? 'primary' : 'secondary'}
            onclick={() => {
              localFilter.conditional = '=';
              localFilter.value = 'false';
            }}
            active={localFilter.value === 'false'}
            size="xs">False</ToggleButton
          >
        </ToggleButtons>
      </div>
    {:else}
      <div class="space-y-2">
        <Input
          id={`${idPrefix}-generic`}
          label="Value"
          placeholder="Enter value..."
          bind:value={localFilter.value}
        />
        <Select
          id={`${idPrefix}-cond`}
          label="Condition"
          bind:value={localFilter.conditional}
        >
          <Option value="=">{translate('common.equal-to')}</Option>
          <Option value="!=">{translate('common.not-equal-to')}</Option>
        </Select>
      </div>
    {/if}

    <div class="flex justify-end gap-2">
      {#if onRemove}
        <Button
          TrailingIcon={IconTrash}
          variant="secondary"
          size="xs"
          data-testid="remove-filter-button"
          type="button"
          onclick={onRemove}>Remove</Button
        >
      {/if}
      <Button
        variant="primary"
        size="xs"
        data-testid="apply-filter-button"
        type="submit">Apply</Button
      >
    </div>
  </div>
</form>
