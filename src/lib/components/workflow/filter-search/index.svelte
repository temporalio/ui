<script lang="ts" context="module">
  import type { Writable } from 'svelte/store';

  export const FILTER_CONTEXT = 'filter-context';

  export interface FilterContext<T> {
    filter: Writable<WorkflowFilter>;
    activeQueryIndex: Writable<number>;
    handleSubmit: () => void;
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import { noop } from 'svelte/internal';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { refresh } from '$lib/stores/workflows';
  import {
    searchAttributes,
    searchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import FilterList from './filter-list.svelte';
  import DateTimeFilter from './datetime-filter.svelte';
  import NumberFilter from './number-filter.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';

  type T = $$Generic;

  const filter = writable<WorkflowFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);

  $: searchAttributeType = $searchAttributes[$filter.attribute];
  $: searchParamQuery = $page.url.searchParams.get('query');
  $: showClearAllButton = $workflowFilters.length && !$filter.attribute;

  setContext<FilterContext<T>>(FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
  });

  function onSearch() {
    const searchQuery = toListWorkflowQueryFromFilters(
      $workflowFilters,
      $workflowSorts,
    );

    if (searchQuery && searchQuery === searchParamQuery) {
      $refresh = Date.now();
    } else {
      updateQueryParameters({
        url: $page.url,
        parameter: 'query',
        value: searchQuery,
        allowEmpty: true,
      });
    }
  }

  function handleSubmit() {
    if ($activeQueryIndex !== null) {
      $workflowFilters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      const previousQuery = $workflowFilters[$workflowFilters.length - 1];
      if (previousQuery) {
        previousQuery.operator = 'AND';
      }
      $workflowFilters = [...$workflowFilters, $filter];
    }
    filter.set(emptyFilter());
    searchAttributeValue = '';
    onSearch();
  }

  function handleClearInput() {
    $workflowFilters = [];
    onSearch();
  }

  function handleNewQuery(value: string) {
    filter.set({ ...emptyFilter(), attribute: value, conditional: '=' });
  }

  let searchAttributeValue = '';
  let options = searchAttributeOptions();

  $: filteredOptions = !searchAttributeValue
    ? options
    : options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );
</script>

<div class="flex w-full gap-4">
  <div class="flex" class:filter={!showClearAllButton}>
    <MenuContainer let:open>
      <Button
        variant="search"
        unroundRight={Boolean($filter.attribute)}
        disabled={$activeQueryIndex !== null}
        icon={$filter.attribute ? null : 'filter'}
        count={$filter.attribute ? 0 : $workflowFilters.length}
        on:click={() => open.update((previous) => !previous)}
      >
        {$filter.attribute || 'Filter'}
      </Button>
      <Menu
        class="max-h-80 overflow-y-scroll w-fit whitespace-nowrap"
        id="search-attribute-menu"
      >
        <Input
          id="filter-search"
          noBorder
          bind:value={searchAttributeValue}
          icon="search"
          placeholder="Search"
        />

        {#each filteredOptions as { value, label }}
          <MenuItem
            on:click={() => {
              handleNewQuery(value);
            }}
          >
            {label}
          </MenuItem>
        {:else}
          <MenuItem on:click={noop}>No Results</MenuItem>
        {/each}
      </Menu>
    </MenuContainer>

    {#if $filter.attribute === 'ExecutionStatus'}
      <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
        <StatusFilter />
      </div>
    {:else if ['Keyword', 'KeywordList', 'Text'].includes(searchAttributeType)}
      <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
        <TextFilter />
      </div>
    {:else if ['Int', 'Double'].includes(searchAttributeType)}
      <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
        <NumberFilter />
      </div>
    {:else if searchAttributeType === 'Datetime'}
      <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
        <DateTimeFilter />
      </div>

      <!-- TODO: Handle boolean search attributes? -->
      <!-- {:else if searchAttributeType === 'Bool'} -->
    {/if}
  </div>

  {#if showClearAllButton}
    <Button variant="link" on:click={handleClearInput}>Clear all</Button>
  {/if}
</div>
<FilterList />

<style lang="postcss">
  .filter {
    @apply grow;
  }
</style>
