<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatISO } from 'date-fns';

  import { durations } from '$lib/utilities/to-duration';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import DatetimePicker from '$lib/holocene/datetime-picker.svelte';
  import Button from '$lib/holocene/button.svelte';

  // WHY DOES THIS CAUSE A DOUBLE RERENDER OF ROOT LAYOUT???????????
  let custom = false;

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

  let startDate = new Date();
  let endDate = new Date();

  const onStartDateChange = (d) => {
    startDate = d.detail;
  };
  const onEndDateChange = (d) => {
    endDate = d.detail;
  };

  const onApply = () => {
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
            <p>Start</p>
            <DatetimePicker
              on:datechange={onStartDateChange}
              selected={startDate}
            />
          </div>
          <div class="flex flex-col">
            <p>End</p>
            <DatetimePicker
              on:datechange={onEndDateChange}
              selected={endDate}
            />
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
