<script lang="ts">
  import { searchAttributes } from '$lib/stores/search-attributes';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Button from '$lib/holocene/button.svelte';

  export let orderType: 'asc' | 'desc';

  export let filters = [];
  export let sorts = [];

  const orders = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];

  const options = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

  // const filterOptions = options.filter((option) =>
  //   filters.find((f) => f.value === option.value),
  // );

  const onOrderBy = () => {
    if (sorts.length) {
      sorts = [];
    } else {
      sorts = [
        {
          label: 'WorkflowType',
          value: 'WorkflowType',
          order: orders[1].value,
        },
      ];
    }
  };
</script>

<div class="flex gap-2">
  <Button
    icon={sorts.length ? 'close' : 'converter-down'}
    variant="secondary"
    on:click={onOrderBy}>Order By</Button
  >
  {#each sorts as { label, value, order }}
    <Select
      id="filter-type"
      bind:value
      class="w-auto"
      menuClass="border-gray-300"
    >
      {#each options as { value, label } (value)}
        <Option {value}>{label}</Option>
      {/each}
    </Select>

    <Select
      id="filter-type"
      bind:value={order}
      class="w-auto"
      menuClass="border-gray-300"
    >
      {#each orders as { value, label } (value)}
        <Option {value}>{label}</Option>
      {/each}
    </Select>
  {/each}
</div>
