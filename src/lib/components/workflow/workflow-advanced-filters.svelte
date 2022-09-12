<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
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
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

  const updateQuery = (event: SubmitEvent): void => {
    const data = new FormData(event.target as HTMLFormElement);
    const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });

    query = String(data.get('query'));
    parameters = toListWorkflowParameters(query);

    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
    });
  };

  let filters = [];
  let orderType = 'desc';
  let bookmarkName = '';
  let activeSearch;
  let showBookmarkSave = false;

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
    const search = { name: bookmarkName, query, filters };
    saveSearch(search);
    activeSearch = search;
  };

  $: options =
    [...$searches]?.map((s) => ({ label: s.name, value: s.name })) ?? [];

  const onBookmarkChange = (name: string) => {
    console.log('$searches: ', $searches);
    const bookmarkedSearch = $searches.find((s) => s.name === name);
    if (bookmarkedSearch) {
      filters = bookmarkedSearch.filters;
      query = bookmarkedSearch.query;
      bookmarkName = name;
      activeSearch = bookmarkedSearch;
    }
  };

  const onStart = () => {
    filters = [
      { filterType: 'workflowType', value: '', operator: '', parenthesis: '' },
    ];
  };

  const onRemove = () => {
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

{#if filters.length}
  <div
    class="fixed bottom-0 left-0 p-4 bg-gray-100 w-full h-10 z-50 overflow-auto"
  >
    <pre class="h-full flex items-center text-lg">{query}</pre>
  </div>
{/if}
<div class="flex gap-4 items-center w-full">
  <!-- <AdvancedOrder bind:orderType /> -->
  {#if filters.length}
    <div class="flex gap-2" in:fade>
      <Button icon="search" variant="primary" on:click={onSearch}>Search</Button
      >
      <Button
        icon="bookmark"
        variant="secondary"
        iconClass={activeSearch ? 'text-yellow-300' : ''}
        on:click={() => (showBookmarkSave = true)}>Save</Button
      >
      {#if activeSearch}
        <Button icon="close" variant="secondary" on:click={onRemove}
          >Remove</Button
        >
      {/if}
      <Button icon="retry" variant="secondary" on:click={onRestart}
        >Start Over</Button
      >
    </div>
  {:else}
    <div class="flex items-center gap-2 w-full" in:fade>
      <Button variant="secondary" on:click={onStart}>New Search +</Button>
      <TypeaheadInput
        icon="bookmark"
        placeholder="Searches"
        class="w-80"
        id="search-name"
        {options}
        onChange={onBookmarkChange}
      />
    </div>
  {/if}
</div>
{#if filters.length}
  <section class="flex flex-col gap-2">
    {#each filters as { filterType, value, operator, parenthesis }, index (index)}
      <div class="flex justify-between gap-16" animate:flip in:fade>
        <AdvancedFilter
          bind:filterType
          bind:value
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
>
  <h3 slot="title" data-cy="data-encoder-title">Bookmark Name</h3>
  <div slot="content">
    <input
      class="block w-80 rounded-md border border-gray-200 p-2"
      placeholder="Name"
      data-cy="bookmark-name-input"
      bind:value={bookmarkName}
    />
  </div>
</Modal>
