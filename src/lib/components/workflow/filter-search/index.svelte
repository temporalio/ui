<script lang="ts" context="module">
  import { afterUpdate } from 'svelte/internal';
  import { writable, type Writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { setContext } from 'svelte';

  export const FILTER_CONTEXT = 'filter-context';

  export interface FilterContext {
    filter: Writable<WorkflowFilter>;
    activeQueryIndex: Writable<number>;
    handleSubmit: () => void;
    focusedElementId: Writable<string>;
    resetFilter: () => void;
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import { showChildWorkflows, workflowFilters } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { refresh } from '$lib/stores/workflows';
  import {
    getFocusedElementId,
    isBooleanFilter,
    isDateTimeFilter,
    isDurationFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/filter-search';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    combineFilters,
    emptyFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import BooleanFilter from './boolean-filter.svelte';
  import CloseFilter from './close-filter-button.svelte';
  import DateTimeFilter from './datetime-filter.svelte';
  import DurationFilter from './duration-filter.svelte';
  import FilterList from './filter-list.svelte';
  import NumberFilter from './number-filter.svelte';
  import SearchAttributeMenu from './search-attribute-menu.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';
  const filter = writable<WorkflowFilter>(emptyFilter());
  const activeQueryIndex = writable<number>(null);
  const focusedElementId = writable<string>('');

  $: ({ attribute, type } = $filter);
  $: searchParamQuery = $page.url.searchParams.get('query');
  $: showClearAllButton = $workflowFilters.length && !attribute;

  setContext<FilterContext>(FILTER_CONTEXT, {
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
    onSearch();
  }

  function handleClearInput() {
    $workflowFilters = [];
    onSearch();
  }

  function updateFocusedElementId() {
    if ($activeQueryIndex !== null) {
      $focusedElementId = getFocusedElementId({ attribute, type });
    }
  }

  $: $activeQueryIndex, updateFocusedElementId();

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
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isTextFilter({ attribute, type })) {
      resetFilter();
    }
  }
</script>

<div class="flex grow flex-col">
  <div class="flex grow flex-col gap-4 sm:flex-row sm:items-center">
    {#if $searchInputViewOpen}
      <WorkflowAdvancedSearch />
    {:else}
      <div
        class="flex items-center"
        class:filter={!showClearAllButton}
        on:keyup={handleKeyUp}
      >
        {#if isStatusFilter(attribute)}
          <StatusFilter />
        {:else}
          <SearchAttributeMenu />
        {/if}

        {#if attribute}
          {#if isTextFilter({ attribute, type })}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <TextFilter />
              <CloseFilter />
            </div>
            <!-- TODO: Add KeywordList support -->
            <!-- {:else if isListFilter(attribute)}
        <div class="w-full" in:fly={{ x: -100, duration: 150 }}>
          <ListFilter />
        </div> -->
          {:else if isDurationFilter(attribute)}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <DurationFilter />
              <CloseFilter />
            </div>
          {:else if isNumberFilter({ attribute, type })}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <NumberFilter />
              <CloseFilter />
            </div>
          {:else if isDateTimeFilter({ attribute, type })}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <DateTimeFilter />
              <CloseFilter />
            </div>
          {:else if isBooleanFilter({ attribute, type })}
            <div
              class="flex w-full items-center"
              in:fly={{ x: -100, duration: 150 }}
            >
              <BooleanFilter />
              <CloseFilter />
            </div>
          {/if}
        {/if}
      </div>

      <div
        class="flex flex-col sm:flex-row {showClearAllButton
          ? 'w-full justify-between'
          : 'justify-end'}"
      >
        {#if showClearAllButton}
          <Button variant="ghost" on:click={handleClearInput}
            >{translate('common.clear-all')}</Button
          >
        {/if}
      </div>
    {/if}
    <MenuContainer>
      <MenuButton
        controls="filter-configuration-menu"
        count={$searchInputViewOpen && $showChildWorkflows ? 2 : 1}
        class="text-nowrap"
      >
        <svelte:fragment slot="leading">
          <Icon name="settings" />
        </svelte:fragment>
      </MenuButton>
      <Menu id="filter-configuration-menu" position="right">
        <div class="flex flex-col gap-4 p-4">
          <ToggleSwitch
            data-testid="show-child-workflow-s-toggle"
            label="List Child Workflows"
            labelPosition="left"
            id="show-child-workflow-input"
            bind:checked={$showChildWorkflows}
            on:change={() => {
              $showChildWorkflows = !$showChildWorkflows;
            }}
          />
          <ToggleSwitch
            data-testid="manual-search-toggle"
            label={translate('workflows.view-search-input')}
            labelPosition="left"
            id="view-search-input"
            bind:checked={$searchInputViewOpen}
            on:change={() => {
              resetFilter();
            }}
          />
        </div>
      </Menu>
    </MenuContainer>
  </div>
  <FilterList />
</div>

<style lang="postcss">
  .filter {
    @apply grow;
  }
</style>
