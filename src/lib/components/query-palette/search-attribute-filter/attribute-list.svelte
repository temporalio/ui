<script lang="ts">
  import { getContext } from 'svelte';

  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from './filter.svelte';

  export let filters: SearchAttributeFilter[];
  export let options: SearchAttributeOption[];

  const { filter } = getContext<FilterContext>(FILTER_CONTEXT);

  function isOptionDisabled(value: string, filters: SearchAttributeFilter[]) {
    return filters.some(
      (filter) =>
        ['=', '!=', 'is', 'is not'].includes(filter.conditional) &&
        filter.attribute === value,
    );
  }

  function handleNewQuery(value: string, type: SearchAttributeType) {
    searchAttributeValue = '';
    const conditional = type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST ? 'in' : '=';
    filter.set({ ...emptyFilter(), attribute: value, conditional, type });
  }

  let searchAttributeValue = '';

  $: filteredOptions = !searchAttributeValue
    ? options
    : options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );
</script>

<div class="grid w-1/2 grid-cols-1 gap-2 border-r border-subtle py-4">
  {#each filteredOptions as { value, label, type }}
    {@const disabled = isOptionDisabled(value, filters)}
    <button
      class="bg-gray-100 flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-indigo-500/50"
      on:click={() => {
        handleNewQuery(value, type);
      }}
      {disabled}
    >
      {label}
    </button>
  {:else}
    <p class="whitespace-nowrap" disabled>{translate('common.no-results')}</p>
  {/each}
</div>
