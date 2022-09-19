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
  import { onMount } from 'svelte';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

  let filters = [];
  let sorts = [];

  let bookmarkName = '';
  let activeSearch;

  let showFilters = true;
  let showBookmarkSave = false;
  let showBookmarkRemove = false;

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters, sorts);
  }

  const onAddFilterOperator = (operator, index) => {
    if (filters[index].operator === operator) {
      filters[index].operator = '';
    } else {
      filters[index] = { ...filters[index], operator };
      if (!filters[index + 1]) {
        filters = [
          ...filters,
          {
            filterType: 'workflowType',
            value: '',
            operator: '',
            parenthesis: '',
            conditional: '=',
          },
        ];
      }
    }
  };

  const onAddFilterParenthesis = (parenthesis, index) => {
    if (filters[index].parenthesis === parenthesis) {
      filters[index].parenthesis = '';
    } else {
      filters[index] = { ...filters[index], parenthesis };
    }
  };

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  };

  const onSave = () => {
    showBookmarkSave = false;
    const search = { name: bookmarkName, query, filters, sorts };
    saveSearch(search);
    activeSearch = search;
  };

  $: bookmarkOptions = (
    [...$searches]?.map((s) => ({ label: s.name, value: s.name })) ?? []
  ).sort((a, b) => a?.label.localeCompare(b.label));

  const onBookmarkChange = (name: string) => {
    const bookmarkedSearch = $searches.find((s) => s.name === name);
    if (bookmarkedSearch) {
      bookmarkName = name;
      filters = [...bookmarkedSearch.filters];
      sorts = [...(bookmarkedSearch?.sorts ?? [])];
      query = bookmarkedSearch.query;
      activeSearch = bookmarkedSearch;
      showFilters = true;
      setTimeout(() => {
        onSearch();
      }, 150);
    }
  };

  const onFilterChange = (filterType: string) => {
    showFilters = true;

    const filter = filterTypeOptions.find((o) => o.value === filterType);
    const conditionals = {
      Keyword: '=',
      Int: '=',
      Datetime: 'In Last',
    };
    filters = [
      {
        filterType,
        value: '',
        operator: '',
        parenthesis: '',
        conditional: conditionals[filter.type],
      },
    ];
  };

  const onRemove = () => {
    showBookmarkRemove = false;
    removeSearch(activeSearch);
    onRestart();
  };

  const onRestart = () => {
    activeSearch = null;
    bookmarkName = '';
    filters = [];
    sorts = [];
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: defaultQuery,
      allowEmpty: true,
    });
  };

  const { copy, copied } = copyToClipboard(500);

  $: filterTypeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];
</script>

{#if !filters.length}
  <div class="mb-4 flex w-full items-center gap-4">
    <div class="flex h-12 w-full items-center gap-2" in:fade>
      <TypeaheadInput
        icon="filter"
        placeholder="Filter workflows"
        class="w-80"
        id="filter-type-name"
        options={filterTypeOptions}
        onChange={onFilterChange}
      />
      <SplitButton id="bookmark" icon="bookmark" class="h-8">
        {#each bookmarkOptions as { label, value } (value)}
          <MenuItem on:click={() => onBookmarkChange(value)}>{label}</MenuItem>
        {/each}
      </SplitButton>
    </div>
  </div>
{:else}
  <div class="bg-offWhite rounded p-6">
    <h3 class="text-base mb-2">Advanced Visibility</h3>
    {#if showFilters}
      <section class="advanced-filters flex flex-col gap-2">
        {#each filters as { filterType, value, operator, parenthesis, conditional }, index (index)}
          <div class="flex justify-between gap-16" transition:slide|local>
            <AdvancedFilter
              bind:filterType
              bind:value
              bind:conditional
              bind:operator
              bind:parenthesis
              isOnly={index === 0 && filters.length === 1}
              setFilterOperator={(operator) =>
                onAddFilterOperator(operator, index)}
              setFilterParenthesis={(parenthesis) =>
                onAddFilterParenthesis(parenthesis, index)}
              removeFilter={() => {
                filters = filters.filter((_, i) => i !== index);
              }}
            />
          </div>
        {/each}
      </section>
    {/if}
    <div class="mt-4 flex w-full items-center gap-4">
      <div class="flex items-center gap-2" in:fade>
        <Button icon="search" variant="primary" thin on:click={onSearch}
          >Search</Button
        >
        <Button icon="retry" variant="secondary" thin on:click={onRestart}
          >Reset</Button
        >
        <!-- <Button
          icon="bookmark"
          variant="secondary"
          thin
          iconClass="text-yellow-500"
          on:click={() => (showBookmarkSave = true)}
          >Save {activeSearch ? 'As' : ''}</Button
        >
        {#if activeSearch}
          <Button
            icon="close"
            variant="destructive"
            thin
            on:click={() => (showBookmarkRemove = true)}>Remove</Button
          >
        {/if}
        <Button
          icon={showFilters ? 'chevron-up' : 'chevron-down'}
          variant="secondary"
          thin
          on:click={() => (showFilters = !showFilters)}
          >{showFilters ? 'Hide' : 'Show'}</Button
        > -->
      </div>
    </div>
  </div>
  <SortFilter orderType="asc" {filters} bind:sorts />
  <div
    class="flex h-8 w-full items-center overflow-x-auto rounded-lg bg-blueGray-200 px-2 py-0"
  >
    <button on:click={(e) => copy(e, query)} class="mx-1">
      <Icon name={$copied ? 'checkmark' : 'copy'} class="mx-1 text-black" />
    </button>
    <pre class="flex h-full items-center text-sm">{query}</pre>
  </div>
{/if}
<Modal
  open={showBookmarkSave}
  on:cancelModal={() => (showBookmarkSave = false)}
  on:confirmModal={onSave}
  confirmText="Save"
  confirmDisabled={!bookmarkName}
>
  <h3 slot="title" data-cy="data-encoder-title">Search Name</h3>
  <div slot="content">
    <input
      class="block w-full rounded-md border border-gray-200 p-2"
      placeholder="Name"
      data-cy="bookmark-name-input"
      bind:value={bookmarkName}
    />
  </div>
</Modal>
<Modal
  open={showBookmarkRemove}
  on:cancelModal={() => (showBookmarkRemove = false)}
  on:confirmModal={onRemove}
  confirmType="destructive"
  confirmText="Remove"
>
  <h3 slot="title" data-cy="data-encoder-title">Remove Search</h3>
  <div slot="content">
    <p>Are you sure you want to remove {activeSearch.name}?</p>
  </div>
</Modal>
