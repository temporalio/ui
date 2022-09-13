<script lang="ts">
  import { searchAttributes } from '$lib/stores/search-attributes';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';

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
  <CustomButton
    icon={sorts.length ? 'close' : 'converter-down'}
    class="border-gray-300 h-8"
    add={!sorts.length}
    remove={!!sorts.length}
    on:click={onOrderBy}>Order By</CustomButton
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
