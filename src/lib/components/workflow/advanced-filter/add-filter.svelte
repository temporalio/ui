<script lang="ts">
  import { fade } from 'svelte/transition';
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowQueryFromAdvancedFilters } from '$lib/utilities/query/list-workflow-query';

  import { searchAttributes } from '$lib/stores/search-attributes';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';

  $: filterTypeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

  export let filters = [];

  let value = '';
  let adding = false;

  function getConditionalForType(filterType: string) {
    const filter = filterTypeOptions.find((t) => t.value === filterType);
    const type = filter?.type;
    if (type === 'Datetime') return 'In Last';
    return '=';
  }

  function getDefaultValueForType(attribute: string) {
    const filter = filterTypeOptions.find((t) => t.value === attribute);
    const type = filter?.type;
    if (type === 'Datetime') return '24 hours';
    if (type === 'Bool') return 'true';

    return '';
  }

  const onAddFilter = (attribute: string) => {
    const _filters = filters.map((filter, index) => {
      if (index === filters.length - 1) {
        return { ...filter, operator: 'AND' };
      }
      return filter;
    });

    filters = [
      ..._filters,
      {
        attribute,
        value: getDefaultValueForType(attribute),
        operator: '',
        parenthesis: '',
        conditional: getConditionalForType(attribute),
      },
    ];
  };

  const onTypeChange = (type: string) => {
    onAddFilter(type);
    value = '';
    adding = false;
  };
</script>

<div class="flex gap-2">
  <CustomButton
    icon={adding ? 'close' : 'add'}
    class="h-10 border border-gray-900 bg-white"
    on:click={() => (adding = !adding)}>Add Filter</CustomButton
  >
  {#if adding}
    <TypeaheadInput
      icon="filter"
      placeholder="Filter type"
      class="w-80"
      id="filter-type-name"
      bind:value
      options={filterTypeOptions}
      onChange={onTypeChange}
      autoFocus
    />
  {/if}
</div>
