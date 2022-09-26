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
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

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
  export let sorts = [];

  let bookmarkName = '';
  let activeSearch;

  let showFilters = true;
  let showBookmarkSave = false;
  let showBookmarkRemove = false;
  let viewQueryString = false;

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

  const onSave = () => {
    showBookmarkSave = false;
    const search = { name: bookmarkName, query, filters, sorts };
    saveSearch(search);
    activeSearch = search;
  };

  const onAddFilterOperator = (operator, index) => {
    if (filters[index].operator === operator) {
      filters[index].operator = '';
    } else {
      filters[index] = { ...filters[index], operator };
      if (!filters[index + 1]) {
        filters = [
          ...filters,
          {
            filterType: filterTypeOptions[filterTypeOptions.length - 1].value,
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
</script>

{#if filters.length}
  <div class="rounded-tr-lg rounded-tl-lg bg-offWhite p-6">
    <h3 class="mb-2 flex items-center gap-2 text-base">
      Advanced Visibility{activeSearch ? `: ${activeSearch.name}` : ''}
    </h3>
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
        <div class="flex w-full items-center gap-4">
          <SortFilter bind:sorts />
        </div>
      </section>
    {/if}
    <div class="mt-4 flex w-full items-center justify-between gap-4">
      <div class="flex items-center gap-2" in:fade>
        <Button variant="primary" icon="search" primary on:click={onSearch}
          >Search</Button
        >
        <CustomButton icon="retry" on:click={onRestart}>Reset</CustomButton>
      </div>
      <div class="flex items-center gap-2">
        <CustomButton
          icon={viewQueryString ? 'eye-hide' : 'eye-show'}
          on:click={() => (viewQueryString = !viewQueryString)}
        />
        <CustomButton
          icon={activeSearch ? 'star-filled' : 'star-empty'}
          iconClass={activeSearch ? 'text-yellow-500' : ''}
          on:click={() => (showBookmarkSave = true)}
        />
        {#if activeSearch}
          <CustomButton
            icon="trash"
            on:click={() => (showBookmarkRemove = true)}
          />
        {/if}
        <CustomButton
          icon={showFilters ? 'chevron-up' : 'chevron-down'}
          on:click={() => (showFilters = !showFilters)}
        />
      </div>
    </div>
  </div>
  {#if viewQueryString}
    <div
      class="h-10 flex w-full items-center overflow-x-auto rounded-br-lg rounded-bl-lg bg-gray-900 p-1 text-white"
      in:fade
    >
      <button on:click={(e) => copy(e, query)} class="mx-1">
        <Icon name={$copied ? 'checkmark' : 'copy'} class="mx-1 text-white" />
      </button>
      <pre class="flex h-full items-center text-sm">{query}</pre>
    </div>
  {/if}
{/if}
<Modal
  open={showBookmarkSave}
  on:cancelModal={() => (showBookmarkSave = false)}
  on:confirmModal={onSave}
  confirmText="Save"
  confirmDisabled={!bookmarkName}
>
  <h3 slot="title" data-cy="data-encoder-title">
    Save {activeSearch ? 'As' : ''}
  </h3>
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
