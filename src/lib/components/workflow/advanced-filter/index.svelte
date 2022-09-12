<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Button from '$lib/holocene/button.svelte';
  import StatusFilter from './status-filter.svelte';
  import SearchAttributeFilter from './search-attribute-filter.svelte';
  import type { FilterKey } from '$lib/utilities/query/list-workflow-query';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { noop } from 'svelte/internal';
  import IntFilter from './int-filter.svelte';
  import KeywordFilter from './keyword-filter.svelte';
  import DatetimeFilter from './datetime-filter.svelte';

  export let filterType: FilterKey;
  export let value: string = '';
  export let conditional: string = '';
  export let operator: string = '';
  export let parenthesis: string = '';
  export let isOnly: boolean = true;
  export let setFilterOperator: (operator: string) => void = () => noop;
  export let setFilterParenthesis: (operator: string) => void = () => noop;
  export let removeFilter: () => void = () => noop;

  const FilterComponents = {
    Keyword: KeywordFilter,
    Int: IntFilter,
    Datetime: DatetimeFilter,
  };

  const baseOptions = [
    {
      label: 'Workflow Type',
      value: 'workflowType',
      type: 'Keyword',
      component: KeywordFilter,
    },
    {
      label: 'Workflow Id',
      value: 'workflowId',
      type: 'Keyword',
      component: KeywordFilter,
    },
    {
      label: 'Status',
      value: 'executionStatus',
      type: 'Keyword',
      component: StatusFilter,
    },
    {
      label: 'Start Time',
      value: 'timeRange',
      type: 'Datetime',
      component: DatetimeFilter,
    },
  ];
  const searchAttributeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
          component: FilterComponents[value] ?? KeywordFilter,
        };
      })
    : [];
  const filterOptions = [...baseOptions, ...searchAttributeOptions];

  let selected = filterOptions?.find((option) => option.value === filterType);

  function getConditionalForType(type) {
    if (type === 'Keyword') return '=';
    if (type === 'Datetime') return 'In Last';
    if (type === 'Int') return '=';
    return '=';
  }

  const onTypeChange = (type: string) => {
    selected = filterOptions?.find((option) => option.value === type);
    value = '';
    conditional = getConditionalForType(selected.type);
  };
</script>

<div class="flex gap-2">
  <Select
    id="filter-type"
    bind:value={filterType}
    onChange={onTypeChange}
    class="w-auto"
    menuClass="border-gray-300"
    displayValue={(value) => filterOptions.find((o) => o.value === value).label}
  >
    {#each filterOptions as { value, label } (value)}
      <Option {value}>{label}</Option>
    {/each}
  </Select>
  <svelte:component
    this={selected.component}
    id={selected.value}
    label={selected.label}
    bind:value
    bind:conditional
  />
  <div class="flex items-center gap-2">
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
