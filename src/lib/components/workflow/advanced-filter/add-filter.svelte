<script lang="ts">
  import { searchAttributes } from '$lib/stores/search-attributes';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';
  import { workflowFilters } from '$lib/stores/filters';

  $: filterTypeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

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
    const _filters = $workflowFilters.map((filter, index) => {
      if (index === $workflowFilters.length - 1) {
        return { ...filter, operator: 'AND' };
      }
      return filter;
    });

    $workflowFilters = [
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

<div class="flex gap-0">
  <CustomButton
    icon={adding ? 'close' : 'add'}
    unroundRight={adding}
    class="h-10 border border-gray-900 bg-white"
    on:click={() => (adding = !adding)}>Add Filter</CustomButton
  >
  {#if adding}
    <TypeaheadInput
      icon="filter"
      placeholder="Filter type"
      class="w-72"
      id="filter-type-name"
      bind:value
      unroundLeft
      options={filterTypeOptions}
      onChange={onTypeChange}
      autoFocus
    />
  {/if}
</div>
