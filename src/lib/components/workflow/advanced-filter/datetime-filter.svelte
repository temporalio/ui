<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import { durations } from '$lib/utilities/to-duration';

  export let value = '';
  export let conditional = '';

  const operations = {
    'In Last': 'In Last',
    After: 'After',
    Before: 'Before',
  };
</script>

<div class="flex gap-2">
  <Select id="operator-filter" bind:value={conditional}>
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
    {#each durations as value}
      <Option {value}>{value}</Option>
    {/each}
  </Select>
</div>
