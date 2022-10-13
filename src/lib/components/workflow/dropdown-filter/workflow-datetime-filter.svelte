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

  import { columnOrderedDurations } from '$lib/utilities/to-duration';
  import { clickOutside } from '$lib/holocene/outside-click';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import SimpleSplitButton from '$lib/holocene/simple-split-button.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { onMount } from 'svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { page } from '$app/stores';
  import Icon from '$lib/holocene/icon/icon.svelte';

  let custom = false;
  let show = false;
  let value = 'All Time';
  let timeField = 'StartTime';

  onMount(() => {
    const timeFilter = $workflowFilters.find(
      (f) => f.attribute === 'StartTime' || f.attribute === 'CloseTime',
    );
    if (timeFilter) {
      value = timeFilter.value;
      timeField = timeFilter.attribute as string;
    }
  });

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

  const onTimeFieldChange = (field: 'StartTime' | 'CloseTime') => {
    if (field !== timeField) {
      timeField = field;
      onChange(value);
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
      attribute: timeField,
      value: `BETWEEN "${formatISO(startDate)}" AND "${formatISO(endDate)}"`,
      conditional: '=',
      operator: '',
      parenthesis: '',
      customDate: true,
    };
    $workflowFilters = [...getOtherFilters(), filter];

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };
</script>

<div
  class="flex items-center"
  use:clickOutside
  on:click-outside={() => (show = false)}
>
  <Select
    class="w-44 rounded"
    id="time-range-filter"
    placeholder="All Time"
    unroundRight
    bind:show
    keepOpen={true}
    {value}
    {onChange}
  >
    <div
      class="flex {custom
        ? 'h-[500px]'
        : 'h-[280px]'} w-[400px] flex-col gap-8 bg-white p-4"
    >
      {#if custom}
        <div class="flex flex-col">
          <p class="text-sm">To</p>
          <div class="flex gap-2">
            <DatePicker
              on:datechange={onStartDateChange}
              selected={startDate}
            />
            <TimePicker on:timechange={onStartDateTimeChange} />
          </div>
        </div>
        <div class="flex flex-col">
          <p class="text-sm">From</p>
          <div class="flex gap-2">
            <DatePicker on:datechange={onEndDateChange} selected={endDate} />
            <TimePicker on:timechange={onEndDateTimeChange} />
          </div>
        </div>
        <div class="flex gap-2">
          <Button on:click={onApply}>Apply</Button>
          <Button variant="secondary" on:click={() => (custom = false)}
            >Cancel</Button
          >
        </div>
      {:else}
        <div>
          <div class="flex w-full flex-wrap">
            <div class="flex w-1/2 flex-col border-b border-gray-300">
              <Option value={'All Time'}>All Time</Option>
            </div>
            <div class="flex w-1/2 flex-col border-b border-gray-300">
              <Option value={'Custom'}>Custom</Option>
            </div>
            {#each columnOrderedDurations as duration}
              <div class="flex w-1/2 flex-col justify-center">
                <Option value={duration}>{duration}</Option>
              </div>
            {/each}
            <div class="flex w-full flex-wrap">
              <div class="flex w-1/2 flex-col border-t border-gray-300">
                <div
                  class="time-label"
                  class:active={timeField === 'StartTime'}
                  on:click={() => onTimeFieldChange('StartTime')}
                >
                  <div class="mr-2 w-6">
                    {#if timeField === 'StartTime'}
                      <Icon name="checkmark" />
                    {/if}
                  </div>
                  Start Time
                </div>
              </div>
              <div class="flex w-1/2 flex-col border-t border-gray-300">
                <div
                  class="time-label"
                  class:active={timeField === 'CloseTime'}
                  on:click={() => onTimeFieldChange('CloseTime')}
                >
                  <div class="mr-2 w-6">
                    {#if timeField === 'CloseTime'}
                      <Icon name="checkmark" />
                    {/if}
                  </div>
                  End Time
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </Select>
  <SimpleSplitButton
    class="rounded-tr rounded-br bg-offWhite"
    buttonClass="border border-gray-900"
    id="datetime"
    label={capitalize($timeFormat)}
    icon="clock"
  >
    <div on:click={() => ($timeFormat = 'relative')} class="timezone-label">
      Relative
    </div>
    <div on:click={() => ($timeFormat = 'UTC')} class="timezone-label">UTC</div>
    <div on:click={() => ($timeFormat = 'local')} class="timezone-label">
      Local
    </div>
  </SimpleSplitButton>
</div>

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
