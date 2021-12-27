<script lang="ts">
  import Select from '$lib/components/select/select.svelte';
  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import FilterInput from '$lib/components/filter-input.svelte';

  export let timeFormat: string = 'relative';

  let workflowIdFilter = '';
  let workflowTypeFilter = '';

  const durations = [
    '10 minutes',
    '60 minutes',
    '3 hours',
    '24 hours',
    '3 days',
    '7 days',
    '30 days',
    '90 days',
  ];

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
</script>

<div class="grid grid-cols-5 gap-4">
  <FilterInput
    parameter="workflow-id"
    name="Workflow ID"
    value={workflowIdFilter}
  />
  <FilterInput
    parameter="workflow-type"
    name="Workflow Type"
    value={workflowTypeFilter}
  />
  <FilterSelect label="Time Range" parameter="time-range" value="24 hours">
    {#each durations as value}
      <Option {value}>{value}</Option>
    {/each}
  </FilterSelect>
  <FilterSelect label="Workflow Status" parameter="status" value={null}>
    {#each Object.entries(statuses) as [label, value]}
      <Option {value}>{label}</Option>
    {/each}
  </FilterSelect>
  <Select id="filter-by-relative-time" bind:value={timeFormat}>
    <Option value={'relative'}>Relative</Option>
    <Option value={'UTC'}>UTC</Option>
    <Option value={'current'}>Current</Option>
  </Select>
</div>
