<script lang="ts">
  import StatusFilter from './status-filter.svelte';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { noop } from 'svelte/internal';
  import IntFilter from './int-filter.svelte';
  import KeywordFilter from './keyword-filter.svelte';
  import DatetimeFilter from './datetime-filter.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import BooleanFilter from './boolean-filter.svelte';
  import PillSelect from '$lib/holocene/select/pill-select.svelte';

  export let attribute: string;
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

  $: selected = filterOptions?.find((option) => option.value === attribute);
</script>

<div class="flex items-center gap-2">
  <PillSelect
    id={attribute}
    placeholder={attribute}
    {value}
    class="rounded border border-gray-900 bg-white"
  >
    <div class="flex items-center gap-2">
      <svelte:component
        this={selected.component}
        id={selected.value}
        label={selected.label}
        bind:value
        bind:conditional
      />
      <CustomButton
        icon="trash"
        class="h-8"
        destructive
        on:click={removeFilter}
      />
    </div>
  </PillSelect>
</div>
