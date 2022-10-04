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
  import BooleanFilter from './boolean-filter.svelte';

  export let filterType: FilterKey;
  export let value: string = '';
  export let conditional: string = '';

  export let removeFilter: () => void = () => noop;

  const FilterComponents = {
    Keyword: KeywordFilter,
    Int: IntFilter,
    Datetime: DatetimeFilter,
    Bool: BooleanFilter,
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
</script>

<div class="flex items-center gap-2">
  <p class="text-sm">{filterType}</p>
  <svelte:component
    this={selected.component}
    id={selected.value}
    label={selected.label}
    bind:value
    bind:conditional
  />
  <div class="flex items-center gap-2">
    <CustomButton
      variant="secondary"
      icon="close"
      thin
      on:click={removeFilter}
    />
  </div>
</div>
