<script lang="ts">
  import StatusFilter from './status-filter.svelte';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { noop } from 'svelte/internal';
  import IntFilter from './int-filter.svelte';
  import KeywordFilter from './keyword-filter.svelte';
  import DatetimeFilter from './datetime-filter.svelte';
  import CustomButton from '$lib/components/workflow/advanced-filter/custom-button.svelte';
  import BooleanFilter from './boolean-filter.svelte';

  export let attribute: string | number;
  export let value: string = '';
  export let conditional: string = '';

  export let removeFilter: () => void = noop;

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

{#if selected}
  <div class="flex items-center gap-2">
    <p class="text-sm">{attribute}</p>
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
        class="h-8 rounded"
        destructive
        on:click={removeFilter}
      />
    </div>
  </div>
{/if}
