<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';

  import { durations } from '$lib/utilities/to-duration';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import DatetimePicker from '$lib/holocene/datetime-picker.svelte';

  let custom = false;

  const getOtherFilters = () =>
    $workflowFilters.filter((f) => f.attribute !== 'StartTime');

  const onChange = (value: string) => {
    if (value === 'All') {
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

  let currentDate = new Date();

  const onDateChange = (d) => {
    currentDate = d.detail;
  };
</script>

<div class="flex items-center">
  <Select
    class="w-44 rounded"
    id="time-range-filter"
    placeholder="Start Time"
    unroundRight
    keepOpen={custom}
    {onChange}
  >
    <div class="flex">
      <div>
        <Option value={'All'}>All Time</Option>
        <Option value={'Custom'}>Custom</Option>
        {#each durations as value}
          <Option {value}>{value}</Option>
        {/each}
      </div>
      {#if custom}
        <div
          class="w-96 bg-white p-4 flex flex-col gap-8 border-l border-gray-900"
        >
          <div class="flex flex-col">
            <p>Start</p>
            <DatetimePicker
              on:datechange={onDateChange}
              selected={currentDate}
            />
          </div>
          <div class="flex flex-col">
            <p>End</p>
            <DatetimePicker
              on:datechange={onDateChange}
              selected={currentDate}
            />
          </div>
        </div>
      {/if}
    </div>
  </Select>
  <CustomSplitButton
    class="rounded-tr rounded-br bg-offWhite"
    buttonClass="border border-gray-900"
    id="datetime"
    label={$timeFormat}
    icon="clock"
  >
    <div
      on:click={() => ($timeFormat = 'relative')}
      class="cursor-pointer px-4 py-2"
    >
      Relative
    </div>
    <div
      on:click={() => ($timeFormat = 'UTC')}
      class="cursor-pointer px-4 py-2"
    >
      UTC
    </div>
    <div
      on:click={() => ($timeFormat = 'local')}
      class="cursor-pointer px-4 py-2"
    >
      Local
    </div>
  </CustomSplitButton>
</div>
