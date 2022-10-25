<script lang="ts">
  import CustomButton from './custom-button.svelte';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { searchAttributeOptions } from '$lib/stores/search-attributes';
  import {
    getConditionalForAttribute,
    getDefaultValueForAttribute,
  } from '$lib/utilities/query/to-list-workflow-filters';

  export let disabled = false;

  let value = '';
  let adding = false;

  const onAddFilter = (attribute: string) => {
    $workflowFilters = [
      ...$workflowFilters,
      {
        attribute,
        value: getDefaultValueForAttribute(attribute),
        operator: '',
        parenthesis: '',
        conditional: getConditionalForAttribute(attribute),
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
    {disabled}
    icon={adding ? 'close' : 'add'}
    class="h-8 rounded-full underline"
    on:click={() => (adding = !adding)}>Add Filter</CustomButton
  >
  {#if adding}
    <TypeaheadInput
      icon="filter"
      placeholder="Filter type"
      class="w-72"
      id="filter-type-name"
      bind:value
      options={searchAttributeOptions()}
      onChange={onTypeChange}
      autoFocus
    />
  {/if}
</div>
