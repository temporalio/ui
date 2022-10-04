<script lang="ts">
  import Select from '$lib/holocene/select/select.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import StatusFilter from './status-filter.svelte';
  import type { FilterKey } from '$lib/utilities/query/list-workflow-query';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { noop } from 'svelte/internal';
  import IntFilter from './int-filter.svelte';
  import KeywordFilter from './keyword-filter.svelte';
  import DatetimeFilter from './datetime-filter.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';

  export let filterType: FilterKey;
  export let value: string = '';
  export let conditional: string = '';
  export let operator: string = '';
  export let parenthesis: string = '';

  export let setFilterOperator: (operator: string) => void = () => noop;
  export let setFilterParenthesis: (operator: string) => void = () => noop;
  export let removeFilter: () => void = () => noop;

  const FilterComponents = {
    Keyword: KeywordFilter,
    Int: IntFilter,
    Datetime: DatetimeFilter,
  };

  const getFilterComponent = (key: string, value: string) => {
    if (key === 'ExecutionStatus') {
      return StatusFilter;
    }
    return FilterComponents[value] ?? KeywordFilter;
  };
  const searchAttributeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
          component: getFilterComponent(key, value),
        };
      })
    : [];
  const filterOptions = [...searchAttributeOptions];

  $: selected = filterOptions?.find((option) => option.value === filterType);

  function getConditionalForType(type) {
    if (type === 'Datetime') return 'In Last';
    // if (type === 'Keyword') return '=';
    // if (type === 'Int') return '=';
    return '=';
  }

  const onTypeChange = (type: string) => {
    selected = filterOptions?.find((option) => option.value === type);
    value = '';
    conditional = getConditionalForType(selected.type);
  };
</script>

<div class="flex items-center gap-2">
  <p class="text-sm">{filterType}</p>
  <!-- <Select
    id="filter-type"
    bind:value={filterType}
    onChange={onTypeChange}
    class="w-auto"
    menuClass="border-gray-300"
  >
    {#each filterOptions as { value, label } (value)}
      <Option {value}>{label}</Option>
    {/each}
  </Select> -->
  <svelte:component
    this={selected.component}
    id={selected.value}
    label={selected.label}
    bind:value
    bind:conditional
  />
  <div class="flex items-center gap-2">
    <!-- <CustomButton
      variant="secondary"
      active={parenthesis === '('}
      thin
      on:click={() => setFilterParenthesis('(')}>(</CustomButton
    >
    <CustomButton
      variant="secondary"
      active={parenthesis === ')'}
      thin
      on:click={() => setFilterParenthesis(')')}>)</CustomButton
    >
    <CustomButton
      variant="secondary"
      active={operator === 'and'}
      thin
      on:click={() => setFilterOperator('and')}>and</CustomButton
    >
    <CustomButton
      variant="secondary"
      active={operator === 'or'}
      thin
      on:click={() => setFilterOperator('or')}>or</CustomButton
    > -->
    <CustomButton
      variant="secondary"
      icon="close"
      thin
      on:click={removeFilter}
    />
  </div>
</div>

<style lang="postcss">
  .indented {
    @apply pl-8;
  }
</style>
