<script lang="ts">
  
  import {
    addHours,
    addMinutes,
    addSeconds,
    formatISO,
    startOfDay,
  } from 'date-fns';
  import { getContext } from 'svelte';
  
  
  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { toDate } from '$lib/utilities/to-duration';
  
  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);

  $: isTimeRange = $filter.conditional === 'BETWEEN';

  let startDate = startOfDay(new Date());
  let endDate = startOfDay(new Date());

  let startHour = '';
  let startMinute = '';
  let startSecond = '';
  let startHalf: 'AM' | 'PM' = 'AM';

  let endHour = '';
  let endMinute = '';
  let endSecond = '';
  let endHalf: 'AM' | 'PM' = 'AM';

  const TIME_UNIT_OPTIONS = ['minutes', 'hours', 'days'];

  let timeUnit = TIME_UNIT_OPTIONS[0];
  let relativeTime = '';

  $: useBetweenDateTimeQuery = isTimeRange || !$supportsAdvancedVisibility;

  const onStartDateChange = (d: CustomEvent) => {
    startDate = startOfDay(d.detail);
  };

  const onEndDateChange = (d: CustomEvent) => {
    endDate = startOfDay(d.detail);
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

  const setHours = (hour: string, half: 'AM' | 'PM') => {
    if (hour) {
      if (hour === '12') {
        return half === 'AM' ? '00' : '12';
      } else if (half === 'PM') {
        return (parseInt(hour) + 12).toString();
      } else {
        return hour;
      }
    } else {
      hour = '';
    }
  };

  const onApply = () => {
    let startDateWithTime = applyTimeChanges(startDate, {
      hour: setHours(startHour, startHalf),
      minute: startMinute,
      second: startSecond,
    });
    let endDateWithTime = applyTimeChanges(endDate, {
      hour: setHours(endHour, endHalf),
      minute: endMinute,
      second: endSecond,
    });

    const value = useBetweenDateTimeQuery
      ? `BETWEEN "${formatISO(startDateWithTime)}" AND "${formatISO(
          endDateWithTime,
        )}"`
      : formatISO(startDateWithTime);

    $filter.value = value;

    if (isTimeRange) {
      $filter.customDate = true;
      $filter.conditional = '';
    } else {
      $filter.customDate = false;
    }

    handleSubmit();
  };

  const onApplyRelativeTime = () => {
    if (!relativeTime) return;
    $filter.value = toDate(`${relativeTime} ${timeUnit}`);
    $filter.customDate = false;

    handleSubmit();
  };

  const error = (x: string) => {
    if (x) return isNaN(parseInt(x));
    return false;
  };
</script>

<div class="flex items-center">
  <ConditionalMenu
    inputId="time-range-filter"
    options={[
      { value: '<=', label: translate('before').toUpperCase() },
      { value: 'BETWEEN', label: translate('between').toUpperCase() },
      { value: '>=', label: translate('after').toUpperCase() },
    ]}
  />
  <MenuContainer>
    <MenuButton
      unroundLeft
      id="time-range-filter"
      controls="time-range-filter-menu"
    >
      {translate('workflows', 'select-time')}
    </MenuButton>
    <Menu
      keepOpen
      id="time-range-filter-menu"
      class="w-[400px] p-2 !overflow-visible"
    >
      {#if isTimeRange}
        <div class="flex flex-col gap-2">
          <DatePicker
            label={translate('start')}
            on:datechange={onStartDateChange}
            selected={startDate}
            todayLabel={translate('today')}
            closeLabel={translate('close')}
            clearLabel={translate('clear-input-button-label')}
          />
          <TimePicker
            bind:hour={startHour}
            bind:minute={startMinute}
            bind:second={startSecond}
            bind:half={startHalf}
          />
          <DatePicker
            label={translate('end')}
            on:datechange={onEndDateChange}
            selected={endDate}
            todayLabel={translate('today')}
            closeLabel={translate('close')}
            clearLabel={translate('clear-input-button-label')}
          />
          <TimePicker
            bind:hour={endHour}
            bind:minute={endMinute}
            bind:second={endSecond}
            bind:half={endHalf}
          />
          <div class="flex justify-end">
            <Button variant="ghost" on:click={onApply}
              >{translate('apply')}</Button
            >
          </div>
        </div>
      {:else}
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold">{translate('relative')}</p>
          <div class="flex justify-between items-center gap-2">
            <div class="flex gap-0">
              <Input
                label={translate('relative')}
                labelHidden
                id="relative-datetime-input"
                bind:value={relativeTime}
                placeholder="00"
                error={error(relativeTime)}
                unroundRight
                class="h-10"
              />
              <Select
                unroundLeft
                bind:value={timeUnit}
                id="relative-datetime-unit-input"
                label={translate('time-unit')}
                labelHidden
              >
                {#each TIME_UNIT_OPTIONS as unit}
                  <Option value={unit}>{unit} {translate('ago')}</Option>
                {/each}
              </Select>
            </div>
            <Button
              variant="ghost"
              disabled={error(relativeTime)}
              on:click={onApplyRelativeTime}>{translate('apply')}</Button
            >
          </div>
          <hr class="border-gray-300 mt-2" />
          <DatePicker
            label={translate('absolute')}
            on:datechange={onStartDateChange}
            selected={startDate}
            todayLabel={translate('today')}
            closeLabel={translate('close')}
            clearLabel={translate('clear-input-button-label')}
          />
          <TimePicker
            bind:hour={startHour}
            bind:minute={startMinute}
            bind:second={startSecond}
            bind:half={startHalf}
          />
          <div class="flex justify-end">
            <Button variant="ghost" on:click={onApply}
              >{translate('apply')}</Button
            >
          </div>
        </div>
      {/if}
    </Menu>
  </MenuContainer>
</div>
