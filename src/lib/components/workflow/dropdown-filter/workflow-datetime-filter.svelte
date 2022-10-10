<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import {
    addHours,
    addMinutes,
    addSeconds,
    endOfDay,
    formatISO,
    startOfDay,
  } from 'date-fns';

  import { durations } from '$lib/utilities/to-duration';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { onMount } from 'svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';

  let custom = false;
  let value = '';

  onMount(() => {
    const startTimeFilter = $workflowFilters.find(
      (f) => f.attribute === 'StartTime',
    );
    if (startTimeFilter) {
      value = startTimeFilter.value;
    }
  });

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'StartTime');

  const onChange = (value: string) => {
    if (value === 'All Time') {
      $workflowFilters = [...getOtherFilters()];
      custom = false;
    } else if (value === 'Custom') {
      custom = true;
    } else {
      const filter = {
        attribute: 'StartTime',
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
      custom = false;
    }
  };

  let startDate = startOfDay(new Date());
  let endDate = endOfDay(new Date());
  let startTime = { hour: '', minute: '', second: '' };
  let endTime = { hour: '', minute: '', second: '' };

  const onStartDateChange = (d) => {
    startDate = startOfDay(d.detail);
  };

  const onStartDateTimeChange = (d) => {
    startTime = d.detail;
  };

  const onEndDateChange = (d) => {
    endDate = startOfDay(d.detail);
  };

  const onEndDateTimeChange = (d) => {
    endTime = d.detail;
  };

  const applyTimeChanges = (date: Date, time) => {
    let _date = new Date(date);
    if (time.hour) _date = addHours(_date, time.hour);
    if (time.minute) _date = addMinutes(_date, time.minute);
    if (time.second) _date = addSeconds(_date, time.second);
    return _date;
  };

  const onApply = () => {
    startDate = applyTimeChanges(startDate, startTime);
    endDate = applyTimeChanges(endDate, endTime);
    const filter = {
      attribute: 'StartTime',
      value: `BETWEEN "${formatISO(startDate)}" AND "${formatISO(endDate)}"`,
      conditional: '=',
      operator: '',
      parenthesis: '',
      customDate: true,
    };
    $workflowFilters = [...getOtherFilters(), filter];
  };
</script>

<div class="flex items-center">
  <Select
    class="w-44 rounded"
    id="time-range-filter"
    placeholder="All Time"
    unroundRight
    keepOpen={custom}
    {value}
    {onChange}
  >
    <div class="flex">
      <div>
        <Option value={'All Time'}>All Time</Option>
        <Option value={'Custom'}>Custom</Option>
        {#each durations as value}
          <Option {value}>{value}</Option>
        {/each}
      </div>
      {#if custom}
        <div
          class="flex w-96 flex-col gap-8 border-l border-gray-900 bg-white p-4"
        >
          <div class="flex flex-col">
            <p class="text-sm">Start</p>
            <div class="flex gap-2">
              <DatePicker
                on:datechange={onStartDateChange}
                selected={startDate}
              />
              <TimePicker on:timechange={onStartDateTimeChange} />
            </div>
          </div>
          <div class="flex flex-col">
            <p class="text-sm">End</p>
            <div class="flex gap-2">
              <DatePicker on:datechange={onEndDateChange} selected={endDate} />
              <TimePicker on:timechange={onEndDateTimeChange} />
            </div>
          </div>
          <Button on:click={onApply}>Apply</Button>
        </div>
      {/if}
    </div>
  </Select>
  <CustomSplitButton
    class="rounded-tr rounded-br bg-offWhite"
    buttonClass="border border-gray-900"
    id="datetime"
    label={capitalize($timeFormat)}
    icon="clock"
  >
    <div
      on:click={() => ($timeFormat = 'relative')}
      class="cursor-pointer px-4 py-2 text-sm"
    >
      Relative
    </div>
    <div
      on:click={() => ($timeFormat = 'UTC')}
      class="cursor-pointer px-4 py-2 text-sm"
    >
      UTC
    </div>
    <div
      on:click={() => ($timeFormat = 'local')}
      class="cursor-pointer px-4 py-2 text-sm"
    >
      Local
    </div>
  </CustomSplitButton>
</div>
