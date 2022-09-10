<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import { durations } from '$lib/utilities/to-duration';

  export let value = '';

  const operations = {
    'In Last': 'In Last',
    After: 'After',
    Before: 'Before',
  };

  let operator: keyof typeof operations = 'In Last';
</script>

<div class="flex gap-2">
  <Select id="operator-filter" bind:value={operator}>
    {#each Object.entries(operations) as [label, value] (label)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
  <Select
    id="time-range"
    bind:value
    class="w-44"
    displayValue={(value) => {
      if (!value) return 'All';
      return value;
    }}
  >
    <Option value={null}>All</Option>
    <!-- {#if parameters.timeRange && !durations.includes(parameters.timeRange)}
      <Option value={parameters.timeRange}>{parameters.timeRange}</Option>
    {/if} -->
    {#each durations as value}
      <Option {value}>{value}</Option>
    {/each}
  </Select>
</div>
