<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';

  export let conditional = '';

  const operations = {
    '=': 'Is',
    '!=': 'Is Not',
  };
</script>

<Select id="operator-filter" bind:value={conditional}>
  {#each Object.entries(operations) as [value, label] (value)}
    <Option {value}>{label}</Option>
  {/each}
</Select>
