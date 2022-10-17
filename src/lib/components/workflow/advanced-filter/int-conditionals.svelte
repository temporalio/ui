<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';

  export let conditional = '';

  const operations = {
    '=': 'Equals',
    '>': 'Greater than',
    '>=': 'Greater than or equal to',
    '<': 'Less than',
    '<=': 'Less than or equal to',
  };
</script>

<Select
  id="int-operation-filter"
  bind:value={conditional}
  displayValue={(value) => operations[value]}
>
  {#each Object.entries(operations) as [value, label] (value)}
    <Option {value}>{label}</Option>
  {/each}
</Select>
