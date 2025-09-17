<script lang="ts">
  import { writable } from 'svelte/store';

  import { addHours, addMinutes, addSeconds, startOfDay } from 'date-fns';
  import { zonedTimeToUtc } from 'date-fns-tz';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import {
    endDate,
    endHour,
    endMinute,
    endSecond,
    getTimezone,
    relativeTimeDuration,
    relativeTimeUnit,
    startDate,
    startHour,
    startMinute,
    startSecond,
    TIME_UNIT_OPTIONS,
    timeFormat,
    timeFormatType,
  } from '$lib/stores/time-format';
  import { formatDate, getSelectedTimezone } from '$lib/utilities/format-date';
  import { isInConditional, isNullConditional } from '$lib/utilities/is';
  import {
    formatListFilterValue,
    isBooleanFilter,
    isDateTimeFilter,
    isListFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';
  import { toDate } from '$lib/utilities/to-duration';

  type Props = {
    filter: SearchAttributeFilter;
    onUpdate: (updatedFilter: SearchAttributeFilter) => void;
    onRemove: () => void;
    index?: number;
    openIndex?: number;
  };

  let {
    filter,
    onUpdate,
    onRemove,
    index = 0,
    openIndex = null,
  }: Props = $props();

  const open = writable(false);
  let localFilter = $state({ ...filter });

  const controlsId = $derived(
    `dropdown-filter-chip-${filter.attribute}-${index}`,
  );
  let chips = $derived(formatListFilterValue(localFilter.value));
  const isNullFilter = $derived(isNullConditional(localFilter.conditional));
  const isTimeRange = $derived(localFilter.conditional === 'BETWEEN');
  const selectedTime = $derived(getSelectedTimezone($timeFormat));

  const defaultConditionOptions = [
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];

  const conditionalOptions = [
    { value: '=', label: translate('common.equal-to'), id: 'equal-to' },
    {
      value: '!=',
      label: translate('common.not-equal-to'),
      id: 'not-equal-to',
    },
    {
      value: 'STARTS_WITH',
      label: translate('common.starts-with'),
      id: 'starts-with',
    },
    ...defaultConditionOptions,
  ];

  const dateConditionalOptions = [
    { value: '<=', label: translate('common.before') },
    { value: 'BETWEEN', label: translate('common.between') },
    { value: '>=', label: translate('common.after') },
    ...defaultConditionOptions,
  ];

  const numberConditionalOptions = [
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
  ];

  const booleanConditionalOptions = [
    { value: 'true', label: translate('common.true'), id: 'is-true' },
    { value: 'false', label: translate('common.false'), id: 'is-false' },
  ];

  const listConditionalOptions = [
    { value: 'in', label: 'In' },
    { value: '=', label: translate('common.equal-to') },
    { value: '!=', label: translate('common.not-equal-to') },
    ...defaultConditionOptions,
  ];

  function getDisplayKeyWithConditional(filter: SearchAttributeFilter): string {
    const { attribute, conditional } = filter;

    if (isStatusFilter(filter)) {
      return `${attribute} =`;
    }

    if (isDateTimeFilter(filter)) {
      if (filter.customDate) return `${attribute} Between`;

      const conditionText =
        conditional === '<'
          ? translate('common.before').toLowerCase()
          : conditional === '>'
            ? translate('common.after').toLowerCase()
            : conditional;
      return `${attribute} ${conditionText}`;
    }

    if (isTextFilter(filter)) {
      const conditionText =
        conditional === 'STARTS_WITH'
          ? translate('common.starts-with').toLowerCase()
          : conditional;
      return `${attribute} ${conditionText}`;
    }

    return `${attribute} ${conditional}`;
  }

  function getDisplayValue(filter: SearchAttributeFilter): string {
    const { value } = filter;

    if (isStatusFilter(filter)) {
      return value;
    }

    if (isDateTimeFilter(filter)) {
      if (filter.customDate) return value.split('BETWEEN')[1];
      return formatDate(value, $timeFormat, {
        relative: true,
        abbrFormat: true,
      });
    }

    if (isTextFilter(filter)) {
      return `"${value}"`;
    }

    return value;
  }

  function applyChanges(e) {
    e.preventDefault();

    if (isInConditional(localFilter.conditional)) {
      localFilter.value = `(${chips.map((item) => `"${item}"`).join(', ')})`;
    } else if (isDateTimeFilter(localFilter)) {
      onTimeApply();
    }
    onUpdate(localFilter);
    $open = false;
  }

  function handleStatusSelect(status: string) {
    localFilter = {
      ...localFilter,
      value: status,
      conditional: '=',
    };
  }

  function timeError(x: string) {
    if (x) return isNaN(Number(x)) || isNaN(parseFloat(x));
    return false;
  }

  const onStartDateChange = (d: CustomEvent) => {
    $startDate = startOfDay(d.detail);
    $startHour = '';
    $startMinute = '';
    $startSecond = '';
  };

  const onEndDateChange = (d: CustomEvent) => {
    $endDate = startOfDay(d.detail);
    $endHour = '';
    $endMinute = '';
    $endSecond = '';
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
    if ($timeFormatType === 'relative' && !isTimeRange) {
      if (!$relativeTimeDuration) return;
      localFilter.value = toDate(
        `${$relativeTimeDuration} ${$relativeTimeUnit}`,
      );
      localFilter.customDate = false;
    } else {
      let startDateWithTime = applyTimeChanges($startDate, {
        hour: $startHour,
        minute: $startMinute,
        second: $startSecond,
      });
      let endDateWithTime = applyTimeChanges($endDate, {
        hour: $endHour,
        minute: $endMinute,
        second: $endSecond,
      });

      const timezone = getTimezone($timeFormat);
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
    }
  };

  $effect(() => {
    if (openIndex === index) {
      $open = true;
    }
  });

  $effect(() => {
    if (!$open) {
      localFilter = { ...filter };
    }
  });
</script>

{#snippet conditionalButtons(options: { value: string; label: string }[])}
  <ToggleButtons>
    {#each options as option}
      <ToggleButton
        variant={localFilter.conditional === option.value
          ? 'primary'
          : 'secondary'}
        on:click={() => {
          if (isNullConditional(option.value)) {
            localFilter.value = null;
          }
          localFilter.conditional = option.value;
        }}
        size="xs">{option.label}</ToggleButton
      >
    {/each}
  </ToggleButtons>
{/snippet}

<MenuContainer {open}>
  <MenuButton size="xs" controls={controlsId} hasIndicator class="bg-secondary">
    {getDisplayKeyWithConditional(filter)}<span class="pl-1 text-brand"
      >{getDisplayValue(filter)}</span
    >
  </MenuButton>

  <Menu id={controlsId} class="max-h-fit w-80 max-w-fit p-4">
    <form onsubmit={applyChanges}>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">Filter by {filter.attribute}</h3>
        </div>

        {#if isStatusFilter(localFilter)}
          <div class="space-y-2">
            {#each workflowStatuses as status}
              <button
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-subtle"
                class:bg-primary={localFilter.value === status}
                class:text-primary-foreground={localFilter.value === status}
                onclick={() => handleStatusSelect(status)}
              >
                <WorkflowStatus {status} />
              </button>
            {/each}
          </div>
        {:else if isTextFilter(localFilter)}
          <div class="space-y-3">
            {@render conditionalButtons(conditionalOptions)}
            <Input
              id={`${controlsId}-text`}
              label="Value"
              placeholder="Enter value..."
              disabled={isNullFilter}
              bind:value={localFilter.value}
            />
          </div>
        {:else if isDateTimeFilter(localFilter)}
          <div class="min-w-[360px] space-y-3">
            {@render conditionalButtons(dateConditionalOptions)}
            {#if isTimeRange}
              <div class="flex flex-col gap-2">
                <DatePicker
                  label={translate('common.start')}
                  on:datechange={onStartDateChange}
                  selected={new Date($startDate)}
                  todayLabel={translate('common.today')}
                  closeLabel={translate('common.close')}
                  clearLabel={translate('common.clear-input-button-label')}
                />
                <TimePicker
                  bind:hour={$startHour}
                  bind:minute={$startMinute}
                  bind:second={$startSecond}
                  twelveHourClock={false}
                />
              </div>
              <div class="flex flex-col gap-2">
                <DatePicker
                  label={translate('common.end')}
                  on:datechange={onEndDateChange}
                  selected={new Date($endDate)}
                  todayLabel={translate('common.today')}
                  closeLabel={translate('common.close')}
                  clearLabel={translate('common.clear-input-button-label')}
                />
                <TimePicker
                  bind:hour={$endHour}
                  bind:minute={$endMinute}
                  bind:second={$endSecond}
                  twelveHourClock={false}
                />
              </div>
            {:else}
              <div class="flex flex-col">
                <RadioInput
                  label={translate('common.relative')}
                  id="relative-time"
                  value="relative"
                  name="time-filter-type"
                  group={timeFormatType}
                />
                <div class="ml-6 flex gap-2 pt-2">
                  <Input
                    label={translate('common.relative')}
                    labelHidden
                    id="relative-datetime-input"
                    bind:value={$relativeTimeDuration}
                    placeholder="00"
                    error={timeError($relativeTimeDuration)}
                    class="h-10"
                    disabled={$timeFormatType !== 'relative'}
                  />
                  <Select
                    bind:value={$relativeTimeUnit}
                    id="relative-datetime-unit-input"
                    label={translate('common.time-unit')}
                    labelHidden
                    disabled={$timeFormatType !== 'relative'}
                  >
                    {#each TIME_UNIT_OPTIONS as unit}
                      <Option value={unit}
                        >{unit} {translate('common.ago')}</Option
                      >
                    {/each}
                  </Select>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <RadioInput
                  label={translate('common.absolute')}
                  id="absolute-time"
                  value="absolute"
                  name="time-filter-type"
                  group={timeFormatType}
                />
                <div class="ml-6 flex flex-col gap-2">
                  <DatePicker
                    label={''}
                    labelHidden
                    on:datechange={onStartDateChange}
                    selected={new Date($startDate)}
                    todayLabel={translate('common.today')}
                    closeLabel={translate('common.close')}
                    clearLabel={translate('common.clear-input-button-label')}
                    disabled={$timeFormatType !== 'absolute'}
                  />
                  <TimePicker
                    bind:hour={$startHour}
                    bind:minute={$startMinute}
                    bind:second={$startSecond}
                    twelveHourClock={false}
                    disabled={$timeFormatType !== 'absolute'}
                  />
                </div>
              </div>
            {/if}
            <p
              class="flex items-center justify-end gap-1 text-sm text-secondary"
            >
              <Icon name="clock" aria-hidden="true" />
              {translate('common.based-on-time-preface')}
              {selectedTime}
            </p>
          </div>
        {:else if isNumberFilter(localFilter)}
          <div class="space-y-3">
            {@render conditionalButtons(numberConditionalOptions)}
            <Input
              id={`${controlsId}-number`}
              label="Value"
              type="number"
              placeholder="Enter number..."
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
                id="list-filter"
                bind:chips
                class="w-full"
                removeChipButtonLabel={(chip) =>
                  translate('workflows.remove-keyword-label', {
                    keyword: chip,
                  })}
                placeholder="{translate(
                  'common.enter',
                )} {localFilter.attribute}"
                external
              />
            {:else}
              <Input
                label={localFilter.attribute}
                labelHidden
                id="list-filter"
                type="search"
                placeholder={`${translate('common.enter')} ${localFilter.attribute}`}
                icon="search"
                class="w-full"
                bind:value={localFilter.value}
              />
            {/if}
          </div>
        {:else if isBooleanFilter(localFilter)}
          <div class="space-y-2">
            {@render conditionalButtons(booleanConditionalOptions)}
          </div>
        {:else}
          <div class="space-y-2">
            <Input
              id={`${controlsId}-generic`}
              label="Value"
              placeholder="Enter value..."
              bind:value={localFilter.value}
            />
            <Select
              id={`${controlsId}-cond`}
              label="Condition"
              bind:value={localFilter.conditional}
            >
              <Option value="=">{translate('common.equal-to')}</Option>
              <Option value="!=">{translate('common.not-equal-to')}</Option>
            </Select>
          </div>
        {/if}

        <div class="flex justify-end gap-2">
          <Button
            trailingIcon="trash"
            variant="secondary"
            size="xs"
            type="button"
            on:click={onRemove}>Remove</Button
          >
          <Button variant="primary" size="xs" type="submit">Apply</Button>
        </div>
      </div>
    </form>
  </Menu>
</MenuContainer>
