<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { durations } from '$lib/utilities/to-duration';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';

  export let datetimeFilter = [];

  const onChange = (value: string) => {
    if (value === 'All') {
      datetimeFilter = [];
    } else {
      datetimeFilter = [
        {
          filterType: 'StartTime',
          value,
          conditional: '=',
          operator: '',
          parenthesis: '',
        },
      ];
    }
  };
</script>

<div class="flex items-center">
  <Select
    class="w-44 rounded"
    id="time-range-filter"
    placeholder="Start Time"
    unroundRight
    {onChange}
  >
    {#each durations as value}
      <Option {value}>{value}</Option>
    {/each}
    <Option value={'Custom'}>Custom</Option>
    <Option value={'All'}>All Time</Option>
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
