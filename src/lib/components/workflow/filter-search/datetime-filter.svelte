<script lang="ts">
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import {
    addHours,
    addMinutes,
    addSeconds,
    formatISO,
    startOfDay,
  } from 'date-fns';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { translate } from '$lib/i18n/translate';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import ConditionalMenu from './conditional-menu.svelte';

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

  const TIME_UNIT_LABELS = {
    minutes: 'mins',
    hours: 'hrs',
  };
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

    $filter.value = `${relativeTime} ${timeUnit}`;
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
      id="time-range-filter"
      controls="time-range-filter-menu"
      class="flex flex-row items-center p-2 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white border border-gray-800 rounded-r h-10"
    >
      {translate('workflows', 'select-time')}
    </MenuButton>
    <Menu
      keepOpen
      id="time-range-filter-menu"
      class="flex rounded h-auto w-[400px] flex-col gap-8 bg-white p-2"
    >
      {#if isTimeRange}
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold">Start</p>
          <div class="flex flex-col gap-2">
            <DatePicker
              on:datechange={onStartDateChange}
              selected={startDate}
            />
            <TimePicker
              bind:hour={startHour}
              bind:minute={startMinute}
              bind:second={startSecond}
              bind:half={startHalf}
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold">End</p>
          <div class="flex flex-col gap-2">
            <DatePicker on:datechange={onEndDateChange} selected={endDate} />
            <TimePicker
              bind:hour={endHour}
              bind:minute={endMinute}
              bind:second={endSecond}
              bind:half={endHalf}
            />
          </div>
        </div>
        <div class="flex justify-end px-4 pb-4">
          <Button variant="link" on:click={onApply}>{translate('apply')}</Button
          >
        </div>
      {:else}
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold">Relative</p>
          <div class="flex justify-between items-center gap-2">
            <div class="flex w-40 gap-0">
              <Input
                id="relative-datetime-input"
                bind:value={relativeTime}
                placeholder="00"
                error={error(relativeTime)}
                unroundRight
                class="h-10"
              />
              <MenuContainer>
                <MenuButton
                  hasIndicator
                  id="relative-datetime-input"
                  controls="relative-datetime-input-menu"
                  class="rounded-r bg-offWhite border border-primary border-l-0 h-10 w-28 px-2"
                >
                  {TIME_UNIT_LABELS[timeUnit] ?? timeUnit}
                  {translate('ago')}
                </MenuButton>
                <Menu id="relative-datetime-input-menu">
                  {#each TIME_UNIT_OPTIONS as unit}
                    <MenuItem
                      on:click={() => {
                        timeUnit = unit;
                      }}>{TIME_UNIT_LABELS[unit] ?? unit}</MenuItem
                    >
                  {/each}
                </Menu>
              </MenuContainer>
            </div>
            <div class="px-4">
              <Button
                variant="link"
                disabled={error(relativeTime)}
                on:click={onApplyRelativeTime}>{translate('apply')}</Button
              >
            </div>
          </div>
          <hr class="border-gray-300 mt-2" />
          <p class="text-sm font-semibold">Absolute</p>
          <DatePicker on:datechange={onStartDateChange} selected={startDate} />
          <TimePicker
            bind:hour={startHour}
            bind:minute={startMinute}
            bind:second={startSecond}
            bind:half={startHalf}
          />
          <div class="flex justify-end p-4">
            <Button variant="link" on:click={onApply}
              >{translate('apply')}</Button
            >
          </div>
        </div>
      {/if}
    </Menu>
  </MenuContainer>
</div>
