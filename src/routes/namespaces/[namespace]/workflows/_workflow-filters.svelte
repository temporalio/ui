<script lang="ts">
  import Select from '$lib/components/select.svelte';
  import FilterSelect from '$lib/components/filter-select.svelte';

  export let timeFormat: string = 'relative';

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
    TimedOut: 'Timed Out',
    Completed: 'Completed',
    Failed: 'Failed',
    'Continued as New': 'ContinuedAsNew',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };
</script>

<section class="p-4 flex gap-8">
  <FilterSelect label="Time Range" parameter="time-range" value="24 hours">
    {#each durations as value}
      <option {value}>{value}</option>
    {/each}
  </FilterSelect>
  <FilterSelect label="Workflow Status" parameter="status" value={null}>
    {#each Object.entries(statuses) as [label, value]}
      <option {value}>{label}</option>
    {/each}
  </FilterSelect>
  <Select
    id="filter-by-relative-time"
    label="Time Format"
    bind:value={timeFormat}
  >
    <option value={'relative'}>Relative</option>
    <option value={'UTC'}>UTC</option>
    <option value={'current'}>Current</option>
  </Select>
</section>
