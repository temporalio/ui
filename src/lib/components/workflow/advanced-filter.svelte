<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import TypeFilter from './advanced-filters/type-filter.svelte';
  import StatusFilter from './advanced-filters/status-filter.svelte';
  import TimeRangeFilter from './advanced-filters/time-range-filter.svelte';
  import IdFilter from './advanced-filters/id-filter.svelte';
  import SearchAttributeFilter from './advanced-filters/search-attribute-filter.svelte';
  import type { FilterKey } from '$lib/utilities/query/list-workflow-query';
  import { searchAttributes } from '$lib/stores/search-attributes';

  export let filterType: FilterKey;
  export let value: string = '';
  export let isOnly: boolean;
  export let isLast: boolean;
  export let addFilter: () => void;
  export let removeFilter: () => void;

  const baseOptions = [
    { label: 'Workflow Type', value: 'workflowType', component: TypeFilter },
    { label: 'Workflow Id', value: 'workflowId', component: IdFilter },
    { label: 'Status', value: 'executionStatus', component: StatusFilter },
    { label: 'Time Range', value: 'timeRange', component: TimeRangeFilter },
  ];
  const searchAttributeOptions = Object.keys($searchAttributes).map((key) => {
    return { label: key, value: key, component: SearchAttributeFilter };
  });
  const filterOptions = [...baseOptions, ...searchAttributeOptions];

  let selected = filterOptions.find((option) => option.value === filterType);

  $: {
    selected = filterOptions.find((option) => option.value === filterType);
    value = '';
  }
</script>

<div class="flex gap-2">
  <Select
    id="filter-type"
    bind:value={filterType}
    class="w-auto"
    menuClass="border-gray-300"
    displayValue={(value) => filterOptions.find((o) => o.value === value).label}
  >
    {#each filterOptions as { value, label } (value)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
  <svelte:component this={selected.component} bind:value />
  <div class="flex gap-2 items-center">
    {#if !isOnly}
      <IconButton
        icon="close"
        classes="w-8 h-8 rounded-full hover:bg-gray-100"
        on:click={removeFilter}
      />
    {/if}
    {#if isLast}
      <IconButton
        icon="add"
        classes="w-8 h-8 rounded-full hover:bg-gray-100"
        on:click={addFilter}
      />
    {/if}
  </div>
</div>
