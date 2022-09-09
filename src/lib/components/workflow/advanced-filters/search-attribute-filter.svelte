<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  export let value = '';

  const operations = {
    Is: 'Is',
  };

  let operator: keyof typeof operations = 'Is';
</script>

<div class="flex gap-2">
  <Select showIcon={false} disabled id="operator-filter" bind:value={operator}>
    {#each Object.entries(operations) as [label, value] (label)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
  <Input
    icon="search"
    id="search-attribute-filter"
    placeholder="Search Attribute"
    class="w-96"
    bind:value
  />
</div>
