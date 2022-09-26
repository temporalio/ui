<script lang="ts">
  import { fade } from 'svelte/transition';
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import {
    toListWorkflowQuery,
    toListWorkflowQueryFromAdvancedFilters,
  } from '$lib/utilities/query/list-workflow-query';

  import Modal from '$holocene/modal.svelte';
  import AdvancedFilter from './advanced-filter/index.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { removeSearch, saveSearch, searches } from '$lib/stores/searches';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import SortFilter from './advanced-filter/sort-filter.svelte';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';

  $: query = $page.url.searchParams.get('query');

  $: filterTypeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

  export let onFilterChange: (filter: {
    label: string;
    value: string;
    type: SearchAttributesValue;
  }) => void;
  export let filters = [];
  export let sorts = [];

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters, sorts);
  }

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  };

  $: bookmarkOptions = (
    [...$searches]?.map((s) => ({ label: s.name, value: s.name })) ?? []
  ).sort((a, b) => a?.label.localeCompare(b.label));

  const onBookmarkChange = (name: string) => {
    const bookmarkedSearch = $searches.find((s) => s.name === name);
    if (bookmarkedSearch) {
      filters = [...bookmarkedSearch.filters];
      sorts = [...(bookmarkedSearch?.sorts ?? [])];
      setTimeout(() => {
        onSearch();
      }, 150);
    }
  };
</script>

{#if !filters.length}
  <div class="mb-4 flex items-center gap-4">
    <div class="flex h-12 w-full items-center gap-0" in:fade>
      <TypeaheadInput
        placeholder="Filter workflows"
        class="w-80"
        id="filter-type-name"
        options={filterTypeOptions}
        onChange={(filterType) =>
          onFilterChange(filterTypeOptions.find((o) => o.value === filterType))}
      />
      <CustomSplitButton
        class="rounded-tr rounded-br bg-offWhite"
        id="saved"
        icon="star-empty"
      >
        {#each bookmarkOptions as { label, value } (value)}
          <MenuItem on:click={() => onBookmarkChange(value)}>{label}</MenuItem>
        {/each}
      </CustomSplitButton>
    </div>
  </div>
{/if}
