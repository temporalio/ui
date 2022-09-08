<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';

  export let value = '';
  export let isOnly: boolean;
  export let isLast: boolean;
  export let addFilter: () => void;
  export let removeFilter: () => void;

  const searchTypes = {
    'Workflow Type': 'WorkflowType',
    'Workflow Id': 'WorkflowId',
    'Time Range': 'TimeRange',
    Status: 'Status',
    'Search Attribute': 'SearchAttribute',
  };

  const operations = {
    Is: 'Is',
    Contains: 'Contains',
    And: 'And',
    Between: 'Between',
  };

  const statuses = {
    All: null,
    Running: 'Running',
    'Timed Out': 'TimedOut',
    Completed: 'Completed',
    Failed: 'Failed',
    'Continued as New': 'ContinuedAsNew',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  let searchType: keyof typeof searchTypes = 'Workflow Type';
  let operator: keyof typeof operations = 'Is';
</script>

<div class="flex gap-2">
  <Select
    id="search-type-filter"
    bind:value={searchType}
    class="w-44"
    onChange={() => value === ''}
  >
    {#each Object.entries(searchTypes) as [label, _] (label)}
      <Option value={label}>{label}</Option>
    {/each}
  </Select>
  <Select id="operator-filter" bind:value={operator} class="w-32">
    {#each Object.entries(operations) as [label, value] (label)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
  {#if searchType === 'Status'}
    <Select id="workflow-status" bind:value class="w-44">
      {#each Object.entries(statuses) as [label, value] (label)}
        <Option value={label}>{label}</Option>
      {/each}
    </Select>
  {:else}
    <Input
      icon="search"
      id="workflow-type-filter"
      placeholder={searchType}
      class="w-96"
      bind:value
    />
  {/if}
  <div class="flex gap-2 items-center">
    {#if !isOnly}
      <IconButton
        icon="close"
        classes="w-8 h-8 rounded-full hover:bg-gray-100"
        on:click={removeFilter}
      />
    {/if}
    {#if isLast}
      <IconButton
        icon="add"
        classes="w-8 h-8 rounded-full hover:bg-gray-100"
        on:click={addFilter}
      />
    {/if}
  </div>
</div>
