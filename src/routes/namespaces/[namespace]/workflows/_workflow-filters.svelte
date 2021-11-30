<script lang="ts">
  import Select from '$lib/components/filter-select.svelte';
  import QuerySelect from '$lib/components/query-param-select.svelte';

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
  <QuerySelect
    label="Time Range"
    parameter="time-range"
    options={durations}
    value="24 hours"
  />
  <QuerySelect
    label="Workflow Status"
    parameter="status"
    options={statuses}
    value={null}
  />
  <Select
    id="filter-by-relative-time"
    name="Time Format"
    bind:value={timeFormat}
  >
    <option value={'relative'}>Relative</option>
    <option value={'UTC'}>UTC</option>
    <option value={'current'}>Current</option>
  </Select>
</section>
