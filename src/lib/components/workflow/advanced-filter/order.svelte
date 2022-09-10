<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';

  export let orderType: 'asc' | 'desc';

  const options = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];
</script>

<div class="flex gap-2">
  <Select
    id="filter-type"
    bind:value={orderType}
    class="w-auto"
    menuClass="border-gray-300"
    displayValue={(value) => value.toUpperCase()}
  >
    {#each options as { value, label } (value)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
</div>
