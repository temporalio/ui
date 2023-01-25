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

  import { durations } from '$lib/utilities/to-duration';

  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { page } from '$app/stores';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import DropdownButton from '$lib/holocene/dropdown-button/dropdown-button.svelte';

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

  const setTimeValues = () => {
    if (!timeFilter) {
      value = 'All Time';
      timeField = 'StartTime';
    } else {
      value = custom ? 'Custom' : timeFilter.value;
      timeField = timeFilter.attribute as string;
    }
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
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
      custom = false;
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };

  const applyTimeChanges = (date: Date, time) => {
    let _date = new Date(date);
    if (time.hour) _date = addHours(_date, time.hour);
    if (time.minute) _date = addMinutes(_date, time.minute);
    if (time.second) _date = addSeconds(_date, time.second);

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

    const filter = {
      attribute: timeField,
      value: `BETWEEN "${formatISO(startDateWithTime)}" AND "${formatISO(
        endDateWithTime,
      )}"`,
      conditional: '=',
      operator: '',
      parenthesis: '',
      customDate: true,
    };
    $workflowFilters = [...getOtherFilters(), filter];

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };
</script>

<DropdownButton id="time" label={value} menuClass="border-none text-lg">
  <MenuItem value="All Time" on:click={() => onChange('All Time')}
    >All Time</MenuItem
  >
  {#each durations as duration}
    <MenuItem on:click={() => onChange(duration)} value={duration}
      >{duration}</MenuItem
    >
  {/each}
</DropdownButton>

<style lang="postcss">
  .time-label {
    @apply flex cursor-pointer whitespace-nowrap px-4 py-3 font-secondary text-sm font-medium hover:bg-gray-50;
  }

  .active {
    @apply text-blue-700;
  }

  .timezone-label {
    @apply flex cursor-pointer whitespace-nowrap px-4 py-3 font-secondary text-sm font-medium hover:bg-gray-50;
  }
</style>
