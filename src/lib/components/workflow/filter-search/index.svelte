<script lang="ts" context="module">
  import type { Writable } from 'svelte/store';

  export const FILTER_CONTEXT = 'filter-context';

  export interface FilterContext<T> {
    filter: Writable<WorkflowFilter>;
    activeQueryIndex: Writable<number>;
    handleSubmit: () => void;
    focusedElementId: Writable<any>;
    resetFilter: () => void;
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import { afterUpdate, noop } from 'svelte/internal';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import { page } from '$app/stores';
  import { translate } from '$lib/i18n/translate';

  import { refresh } from '$lib/stores/workflows';
  import { sortedSearchAttributOptions } from '$lib/stores/search-attributes';
  import { workflowFilters } from '$lib/stores/filters';
  import {
    emptyFilter,
    combineFilters,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import {
    isBooleanFilter,
    isDateTimeFilter,
    isListFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/filter-search';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import BooleanFilter from './boolean-filter.svelte';
  import FilterList from './filter-list.svelte';
  import DateTimeFilter from './datetime-filter.svelte';
  import NumberFilter from './number-filter.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';

  type T = $$Generic;

  const filter = writable<WorkflowFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');

  $: searchParamQuery = $page.url.searchParams.get('query');
  $: showClearAllButton = $workflowFilters.length && !$filter.attribute;

  let viewAdvancedSearchInput = false;

  setContext<FilterContext<T>>(FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
  });

  function onSearch() {
    const searchQuery = toListWorkflowQueryFromFilters(
      combineFilters($workflowFilters),
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

  function getFocusedElementId(attribute: string) {
    if (isStatusFilter(attribute)) return 'status-filter';

    if (isTextFilter(attribute)) return 'text-filter-search';

    if (isListFilter(attribute)) return 'list-filter-search';

    if (isNumberFilter(attribute) || isDateTimeFilter(attribute))
      return 'conditional-menu-button';

    if (isBooleanFilter(attribute)) return 'boolean-filter';

    return '';
  }

  function isOptionDisabled(value: string, filters: WorkflowFilter[]) {
    return filters.some(
      (filter) => filter.conditional === '=' && filter.attribute === value,
    );
  }

  function handleNewQuery(value: string) {
    filter.set({ ...emptyFilter(), attribute: value, conditional: '=' });
    $focusedElementId = getFocusedElementId(value);
  }

  function updateFocusedElementId() {
    if ($activeQueryIndex !== null) {
      $focusedElementId = getFocusedElementId($filter.attribute);
    }
  }

  $: $activeQueryIndex, updateFocusedElementId();

  let searchAttributeValue = '';
  //  TODO: Add KeywordList support
  let options = sortedSearchAttributOptions().filter(
    (option) => !isListFilter(option.value),
  );

  $: filteredOptions = !searchAttributeValue
    ? options
    : options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );

  function updateFocus() {
    if ($focusedElementId) {
      const element = document.getElementById($focusedElementId);
      if (element) {
        element.focus();
        if (element instanceof HTMLButtonElement) {
          element.click();
        }
      }
    }
  }

  afterUpdate(() => {
    updateFocus();
  });

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(emptyFilter());
    searchAttributeValue = '';
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isTextFilter($filter.attribute)) {
      resetFilter();
    }
  }
</script>

{#if viewAdvancedSearchInput}
  <div class="flex flex-col sm:flex-row gap-4">
    <WorkflowAdvancedSearch />
    <label
      for="view-search-input"
      class="flex items-center gap-4 font-secondary text-sm"
      >{translate('workflows', 'view-search-input')}
      <ToggleSwitch
        id="view-search-input"
        checked={viewAdvancedSearchInput}
        on:change={() => (viewAdvancedSearchInput = !viewAdvancedSearchInput)}
      />
    </label>
  </div>
{:else}
  <div class="flex w-full gap-4">
    <div class="flex" class:filter={!showClearAllButton} on:keyup={handleKeyUp}>
      {#if isStatusFilter($filter.attribute)}
        <StatusFilter />
      {:else}
        <MenuContainer let:open>
          <Button
            variant="search"
            unroundRight={Boolean($filter.attribute)}
            disabled={$activeQueryIndex !== null}
            icon={$filter.attribute ? null : 'filter'}
            count={$filter.attribute ? 0 : $workflowFilters.length}
            on:click={() => open.update((previous) => !previous)}
          >
            {$filter.attribute || translate('workflows', 'filter')}
          </Button>
          <Menu
            class="max-h-80 overflow-y-scroll w-fit min-w-[240px] whitespace-nowrap"
            id="search-attribute-menu"
          >
            <Input
              id="filter-search"
              noBorder
              bind:value={searchAttributeValue}
              icon="search"
              placeholder={translate('search')}
            />

            {#each filteredOptions as { value, label }}
              {@const disabled = isOptionDisabled(value, $workflowFilters)}
              <MenuItem
                on:click={() => {
                  handleNewQuery(value);
                }}
                {disabled}
              >
                {label}
              </MenuItem>
            {:else}
              <MenuItem on:click={noop}>{translate('no-results')}</MenuItem>
            {/each}
          </Menu>
        </MenuContainer>
      {/if}

      {#if isTextFilter($filter.attribute)}
        <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
          <TextFilter />
        </div>
        <!-- TODO: Add KeywordList support -->
        <!-- {:else if isListFilter($filter.attribute)}
      <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
        <ListFilter />
      </div> -->
      {:else if isNumberFilter($filter.attribute)}
        <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
          <NumberFilter />
        </div>
      {:else if isDateTimeFilter($filter.attribute)}
        <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
          <DateTimeFilter />
        </div>
      {:else if isBooleanFilter($filter.attribute)}
        <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
          <BooleanFilter />
        </div>
      {/if}
    </div>

    <div
      class="flex flex-col sm:flex-row {showClearAllButton
        ? 'justify-between w-full'
        : 'justify-end'}"
    >
      {#if showClearAllButton}
        <Button variant="ghost" on:click={handleClearInput}
          >{translate('clear-all')}</Button
        >
      {/if}
      <label
        for="view-search-input"
        class="flex items-center gap-4 font-secondary text-sm"
        >{translate('workflows', 'view-search-input')}
        <ToggleSwitch
          id="view-search-input"
          checked={viewAdvancedSearchInput}
          on:change={() => {
            viewAdvancedSearchInput = !viewAdvancedSearchInput;
            resetFilter();
          }}
        />
      </label>
    </div>
  </div>

  <FilterList />
{/if}

<style lang="postcss">
  .filter {
    @apply grow;
  }
</style>
