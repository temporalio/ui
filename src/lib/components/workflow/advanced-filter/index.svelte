<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Button from '$lib/holocene/button.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import TypeFilter from './type-filter.svelte';
  import StatusFilter from './status-filter.svelte';
  import TimeRangeFilter from './time-range-filter.svelte';
  import IdFilter from './id-filter.svelte';
  import SearchAttributeFilter from './search-attribute-filter.svelte';
  import type { FilterKey } from '$lib/utilities/query/list-workflow-query';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { noop } from 'svelte/internal';

  export let filterType: FilterKey;
  export let value: string = '';
  export let operator: string = '';
  export let parenthesis: string = '';
  export let isOnly: boolean = true;
  export let setFilterOperator: (operator: string) => void = () => noop;
  export let setFilterParenthesis: (operator: string) => void = () => noop;
  export let removeFilter: () => void = () => noop;

  const baseOptions = [
    { label: 'Workflow Type', value: 'workflowType', component: TypeFilter },
    { label: 'Workflow Id', value: 'workflowId', component: IdFilter },
    { label: 'Status', value: 'executionStatus', component: StatusFilter },
    { label: 'Time Range', value: 'timeRange', component: TimeRangeFilter },
  ];
  const searchAttributeOptions = $searchAttributes
    ? Object.keys($searchAttributes).map((key) => {
        return { label: key, value: key, component: SearchAttributeFilter };
      })
    : [];
  const filterOptions = [...baseOptions, ...searchAttributeOptions];

  let selected = filterOptions?.find((option) => option.value === filterType);

  $: {
    selected = filterOptions?.find((option) => option.value === filterType);
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
    <Button
      variant="secondary"
      active={parenthesis === '('}
      thin
      on:click={() => setFilterParenthesis('(')}>(</Button
    >
    <Button
      variant="secondary"
      active={parenthesis === ')'}
      thin
      on:click={() => setFilterParenthesis(')')}>)</Button
    >
    <Button
      variant="secondary"
      active={operator === 'and'}
      thin
      on:click={() => setFilterOperator('and')}>AND</Button
    >
    <Button
      variant="secondary"
      active={operator === 'or'}
      thin
      on:click={() => setFilterOperator('or')}>OR</Button
    >
    {#if !isOnly}
      <Button variant="secondary" icon="close" thin on:click={removeFilter} />
    {/if}
    <!-- <Button variant="secondary" icon="chevron-left" thin />
    <Button variant="secondary" icon="chevron-right" thin /> -->
  </div>
</div>
