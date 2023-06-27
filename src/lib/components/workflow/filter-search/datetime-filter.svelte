<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import {
    addHours,
    addMinutes,
    addSeconds,
    formatISO,
    startOfDay,
  } from 'date-fns';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { columnOrderedDurations } from '$lib/utilities/to-duration';
  import { translate } from '$lib/i18n/translate';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import ConditionalMenu from './conditional-menu.svelte';

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);

  $: value = $filter.customDate ? 'Custom' : $filter.value ?? '';

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

  $: useBetweenDateTimeQuery =
    $filter.customDate || !$supportsAdvancedVisibility;

  const onChange = (_value: string) => {
    value = _value;
    if (value === 'Custom') {
      $filter.customDate = true;
      $filter.conditional = 'BETWEEN';
    } else {
      $filter.value = value;
      $filter.customDate = false;
      handleSubmit();
    }
  };

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
      : `> "${formatISO(startDateWithTime)}"`;

    $filter.value = value;
    handleSubmit();
  };

  onMount(() => {
    $filter.conditional = '>=';
  });
</script>

<div class="flex items-center">
  {#if $filter.customDate}
    <ConditionalMenu options={[{ value: 'BETWEEN' }]} disabled />
  {:else}
    <ConditionalMenu
      options={[
        { value: '>=', label: 'BEFORE' },
        { value: '<=', label: 'AFTER' },
      ]}
    />
  {/if}
  <MenuContainer>
    <MenuButton
      id="time-range-filter"
      controls="time-range-filter-menu"
      class="flex flex-row items-center p-2 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white border border-l-0  border-gray-800 rounded-r h-10"
    >
      {value || 'Select Time'}
    </MenuButton>
    <Menu
      keepOpen
      id="time-range-filter-menu"
      class="flex rounded h-auto w-[400px] flex-col gap-8 bg-white p-2"
    >
      {#if $filter.customDate}
        <div class="flex flex-col">
          <p class="text-sm">Start</p>
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
        <div class="flex flex-col">
          <p class="text-sm">End</p>
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
        <div class="flex gap-2">
          <Button on:click={onApply}>{translate('apply')}</Button>
          <Button
            variant="secondary"
            on:click={() => {
              $filter.customDate = false;
              $filter.conditional = '>=';
              $filter.value = '';
            }}>{translate('cancel')}</Button
          >
        </div>
      {:else}
        <div>
          <div class="flex w-full flex-wrap">
            {#each columnOrderedDurations as duration}
              <div class="flex w-1/2 flex-col justify-center">
                <MenuItem on:click={() => onChange(duration)}
                  >{duration}</MenuItem
                >
              </div>
            {/each}

            <div class="flex w-full flex-col border-t border-gray-300">
              <MenuItem on:click={() => onChange('Custom')}
                >{translate('custom')}</MenuItem
              >
            </div>
          </div>
        </div>
      {/if}
    </Menu>
  </MenuContainer>
</div>
