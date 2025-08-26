<script lang="ts">
  import { addHours, addMinutes, addSeconds, startOfDay } from 'date-fns';
  import { zonedTimeToUtc } from 'date-fns-tz';
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
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
  import { toDate } from '$lib/utilities/to-duration';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './filter.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  const error = (x: string) => {
    if (x) return isNaN(Number(x)) || isNaN(parseFloat(x));
    return false;
  };

  const isTimeRange = $derived($filter.conditional === 'BETWEEN');
  const useBetweenDateTimeQuery = $derived(
    isTimeRange || !$supportsAdvancedVisibility,
  );
  const disabled = $derived(
    $timeFormatType === 'relative' &&
      !useBetweenDateTimeQuery &&
      (!$relativeTimeDuration || error($relativeTimeDuration)),
  );

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

  const onApply = () => {
    if ($timeFormatType === 'relative' && !useBetweenDateTimeQuery) {
      if (!$relativeTimeDuration) return;
      $filter.value = toDate(`${$relativeTimeDuration} ${$relativeTimeUnit}`);
      $filter.customDate = false;
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

      const value = useBetweenDateTimeQuery
        ? `BETWEEN "${formattedStartTime}" AND "${formattedEndTime}"`
        : formattedStartTime;

      $filter.value = value;

      if (isTimeRange) {
        $filter.customDate = true;
        $filter.conditional = '';
      } else {
        $filter.customDate = false;
      }
    }

    handleSubmit();
  };
</script>

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
  <div class="flex items-center justify-center gap-2">
    <RadioInput
      label={translate('common.relative')}
      id="relative-time"
      value="relative"
      name="time-filter-type"
      group={timeFormatType}
    />
    <RadioInput
      label={translate('common.absolute')}
      id="absolute-time"
      value="absolute"
      name="time-filter-type"
      group={timeFormatType}
    />
  </div>
  {#if $timeFormatType === 'relative'}
    <div class="flex gap-2">
      <Input
        label={translate('common.relative')}
        labelHidden
        id="relative-datetime-input"
        bind:value={$relativeTimeDuration}
        placeholder="00"
        error={error($relativeTimeDuration)}
        class="h-10"
      />
      <Select
        bind:value={$relativeTimeUnit}
        id="relative-datetime-unit-input"
        label={translate('common.time-unit')}
        labelHidden
      >
        {#each TIME_UNIT_OPTIONS as unit}
          <Option value={unit}>{unit} {translate('common.ago')}</Option>
        {/each}
      </Select>
    </div>
  {/if}
  {#if $timeFormatType === 'absolute'}
    <div class="flex flex-col gap-2">
      <DatePicker
        label={''}
        labelHidden
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
  {/if}
{/if}
<ConditionalMenu
  inputId="time-range-filter"
  options={[
    { value: '<=', label: translate('common.before') },
    { value: 'BETWEEN', label: translate('common.between') },
    { value: '>=', label: translate('common.after') },
  ]}
/>
<div class="flex items-center">
  <Button class="w-full" size="sm" on:click={onApply} {disabled}
    >{translate('common.apply')}</Button
  >
</div>
