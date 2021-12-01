<script lang="ts">
  import Select from '$lib/components/select/select.svelte';
  import Option from '$lib/components/select/option.svelte';

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
  <Select parameter="time-range" options={durations} value="24 hours" />
  <Select parameter="status" value={null} options={statuses} />
  <Select id="filter-by-relative-time" bind:value={timeFormat}>
    <Option value={'relative'}>Relative</Option>
    <Option value={'UTC'}>UTC</Option>
    <Option value={'current'}>Current</Option>
  </Select>
</section>
