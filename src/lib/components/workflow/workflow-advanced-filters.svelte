<script lang="ts">
  import { fade } from 'svelte/transition';
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import {
    toListWorkflowQuery,
    toListWorkflowQueryFromAdvancedFilters,
  } from '$lib/utilities/query/list-workflow-query';

  import Modal from '$holocene/modal.svelte';
  import AdvancedFilter from './advanced-filter/index.svelte';
  import AdvancedOrder from './advanced-filter/order.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { removeSearch, saveSearch, searches } from '$lib/stores/searches';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

  let filters = [];
  let orderType = 'desc';
  let bookmarkName = '';
  let activeSearch;
  let showFilters = true;
  let showBookmarkSave = false;
  let showBookmarkRemove = false;

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters);
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
    ('this is foo bar'.match(/o/g) || []).length;

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
    const search = { name: bookmarkName, query, filters };
    saveSearch(search);
    activeSearch = search;
  };

  $: options = (
    [...$searches]?.map((s) => ({ label: s.name, value: s.name })) ?? []
  ).sort((a, b) => a?.label.localeCompare(b.label));

  const onBookmarkChange = (name: string) => {
    const bookmarkedSearch = $searches.find((s) => s.name === name);
    if (bookmarkedSearch) {
      bookmarkName = name;
      filters = [...bookmarkedSearch.filters];
      query = bookmarkedSearch.query;
      activeSearch = bookmarkedSearch;
      showFilters = true;
      onSearch();
    }
  };

  const onStart = () => {
    showFilters = true;
    filters = [
      {
        filterType: 'workflowType',
        value: '',
        operator: '',
        parenthesis: '',
        conditional: '=',
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
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: defaultQuery,
      allowEmpty: true,
    });
  };
</script>

<!-- {#if filters.length}
  <div
    class="fixed bottom-0 left-0 p-4 bg-gray-100 w-full h-10 z-50 overflow-auto"
  >
    <pre class="h-full flex items-center text-lg">{query}</pre>
  </div>
{/if} -->
{#if activeSearch?.name}
  <div class="text-sm">{activeSearch?.name}</div>
{/if}
<div class="mb-4 flex w-full items-center gap-4">
  <!-- <AdvancedOrder bind:orderType /> -->
  {#if filters.length}
    <div class="flex items-center gap-2" in:fade>
      <Button icon="search" variant="primary" on:click={onSearch}>Search</Button
      >
      <Button icon="retry" variant="secondary" on:click={onRestart}
        >Start Over</Button
      >
      <Button
        icon="bookmark"
        variant="secondary"
        iconClass={activeSearch ? 'text-yellow-300' : 'text-gray-300'}
        on:click={() => (showBookmarkSave = true)}>Save</Button
      >
      {#if activeSearch}
        <Button
          icon="close"
          variant="destructive"
          on:click={() => (showBookmarkRemove = true)}>Remove</Button
        >
      {/if}
      <Button
        icon={showFilters ? 'chevron-up' : 'chevron-down'}
        variant="secondary"
        on:click={() => (showFilters = !showFilters)}
        >{showFilters ? 'Hide' : 'Show'}</Button
      >
    </div>
  {:else}
    <div class="flex h-12 w-full items-center gap-2" in:fade>
      <Button icon="add" variant="secondary" on:click={onStart}
        >New Search</Button
      >
      <TypeaheadInput
        icon="bookmark"
        placeholder="Saved Searches..."
        class="w-96"
        id="search-name"
        {options}
        onChange={onBookmarkChange}
      />
    </div>
  {/if}
</div>
{#if filters.length && showFilters}
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
          setFilterOperator={(operator) => onAddFilterOperator(operator, index)}
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
