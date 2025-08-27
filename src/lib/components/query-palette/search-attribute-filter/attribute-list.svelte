<script lang="ts">
  import { getContext } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import {
    isCustomSearchAttribute,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  let { activeFilter }: { activeFilter: SearchAttributeFilter } = $props();

  const { filter } = getContext<FilterContext>(FILTER_CONTEXT);

  const options = $derived($sortedSearchAttributeOptions);

  function handleNewQuery(value: string, type: SearchAttributeType) {
    searchAttributeValue = '';
    const conditional = type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST ? 'in' : '=';
    filter.set({ ...emptyFilter(), attribute: value, conditional, type });
  }

  let searchAttributeValue = $state('');

  const filteredOptions = $derived(
    !searchAttributeValue
      ? options
      : options.filter((option) =>
          option.value
            .toLowerCase()
            .includes(searchAttributeValue.toLowerCase()),
        ),
  );
</script>

<div
  class="flex w-full flex-row gap-2 overflow-auto border-r border-subtle p-4 lg:w-1/3 lg:flex-col"
>
  <Input
    id="search-attribute"
    label="search"
    class="hidden lg:block"
    labelHidden
    bind:value={searchAttributeValue}
    placeholder={translate('common.search')}
  />
  <ol class="flex gap-0.5 lg:flex-col">
    {#each filteredOptions as { value, label, type }}
      <li class="w-full">
        <button
          class="bg-gray-100 flex w-full cursor-pointer flex-col items-start rounded-sm px-2
          py-1 text-sm hover:bg-interactive-hover hover:text-white {activeFilter?.attribute ===
          value
            ? 'surface-secondary'
            : ''}"
          onclick={() => {
            handleNewQuery(value, type);
          }}
        >
          {label}
          <div class="flex items-center gap-1 text-xs">
            {#if isCustomSearchAttribute(label)}
              Custom
            {/if}
            {type}
          </div>
        </button>
      </li>
    {:else}
      <li class="whitespace-nowrap">{translate('common.no-results')}</li>
    {/each}
  </ol>
</div>
