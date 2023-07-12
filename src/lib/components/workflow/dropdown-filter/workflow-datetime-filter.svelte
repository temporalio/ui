<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import {
    addHours,
    addMinutes,
    addSeconds,
    formatISO,
    startOfDay,
  } from 'date-fns';

  import { columnOrderedDurations } from '$lib/utilities/to-duration';
  import { persistedTimeFilter, workflowFilters } from '$lib/stores/filters';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Button from '$lib/holocene/button.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { page } from '$app/stores';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';

  let custom = false;
  let value = 'All Time';
  let timeField = 'StartTime';

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

  $: timeFilter = $workflowFilters.find(
    (f) => f.attribute === 'StartTime' || f.attribute === 'CloseTime',
  );
  $: useBetweenDateTimeQuery = custom || !$supportsAdvancedVisibility;

  const setTimeValues = () => {
    if (!timeFilter) {
      value = 'All Time';
      timeField = 'StartTime';
    } else {
      value =
        custom || !columnOrderedDurations.includes(timeFilter?.value)
          ? 'Custom'
          : timeFilter.value;
      timeField = timeFilter.attribute as string;
    }

    const shouldUpdateTimeFilter =
      !timeFilter ||
      columnOrderedDurations.includes(timeFilter?.value) ||
      timeFilter?.customDate;
    if (shouldUpdateTimeFilter) $persistedTimeFilter = timeFilter;
  };

  $: timeFilter, setTimeValues();

  const getOtherFilters = () =>
    $workflowFilters.filter(
      (f) => f.attribute !== 'StartTime' && f.attribute !== 'CloseTime',
    );

  const onChange = (_value: string) => {
    value = _value;
    if (value === 'All Time') {
      $workflowFilters = [...getOtherFilters()];
      custom = false;
    } else if (value === 'Custom') {
      custom = true;
    } else {
      const filter = {
        attribute: timeField,
        value,
        conditional: '>',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
      custom = false;
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters);
  };

  const onTimeFieldChange = (field: 'StartTime' | 'CloseTime') => {
    if (field !== timeField) {
      timeField = field;
      onChange(value);
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

    const query = useBetweenDateTimeQuery
      ? `BETWEEN "${formatISO(startDateWithTime)}" AND "${formatISO(
          endDateWithTime,
        )}"`
      : `> "${formatISO(startDateWithTime)}"`;

    const filter = {
      attribute: timeField,
      value: query,
      conditional: '=',
      operator: '',
      parenthesis: '',
      customDate: true,
    };
    $workflowFilters = [...getOtherFilters(), filter];

    updateQueryParamsFromFilter($page.url, $workflowFilters);
  };
</script>

<div class="flex items-center">
  <MenuContainer>
    <MenuButton
      id="time-range-filter"
      hasIndicator
      controls="time-range-filter-menu"
      class="flex flex-row items-center p-2 bg-white border border-r-0 border-primary rounded-l h-10 w-44"
    >
      {value}
    </MenuButton>
    <Menu
      keepOpen
      id="time-range-filter-menu"
      class="flex rounded h-auto w-[400px] flex-col gap-8 bg-white p-2"
    >
      {#if custom}
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
          <Button variant="secondary" on:click={() => (custom = false)}
            >{translate('cancel')}</Button
          >
        </div>
      {:else}
        <div>
          <div class="flex w-full flex-wrap">
            <div class="flex w-1/2 flex-col border-b border-gray-300">
              <MenuItem on:click={() => onChange('All Time')}
                >{translate('all-time')}</MenuItem
              >
            </div>
            <div class="flex w-1/2 flex-col border-b border-gray-300">
              <MenuItem on:click={() => onChange('Custom')}
                >{translate('custom')}</MenuItem
              >
            </div>
            {#each columnOrderedDurations as duration}
              <div class="flex w-1/2 flex-col justify-center">
                <MenuItem on:click={() => onChange(duration)}
                  >{duration}</MenuItem
                >
              </div>
            {/each}
            <div class="flex w-full flex-wrap">
              <div class="flex w-1/2 flex-col border-t border-gray-300">
                <MenuItem
                  selected={timeField === 'StartTime'}
                  on:click={() => onTimeFieldChange('StartTime')}
                >
                  {translate('start-time')}
                </MenuItem>
              </div>
              <div class="flex w-1/2 flex-col border-t border-gray-300">
                <MenuItem
                  selected={timeField === 'CloseTime'}
                  on:click={() => onTimeFieldChange('CloseTime')}
                >
                  {translate('end-time')}
                </MenuItem>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </Menu>
  </MenuContainer>
  <MenuContainer>
    <MenuButton
      class="p-2 bg-white border border-primary rounded-r h-10 w-32"
      id="datetime-filter"
      controls="datetime-filter-menu"
      hasIndicator
      icon="clock"
    >
      {capitalize($timeFormat)}
    </MenuButton>
    <Menu id="datetime-filter-menu">
      <MenuItem on:click={() => ($timeFormat = 'relative')}
        >{translate('relative')}</MenuItem
      >
      <MenuItem on:click={() => ($timeFormat = 'UTC')}
        >{translate('utc')}</MenuItem
      >
      <MenuItem on:click={() => ($timeFormat = 'local')}
        >{translate('local')}</MenuItem
      >
    </Menu>
  </MenuContainer>
</div>
