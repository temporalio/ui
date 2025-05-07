<script lang="ts">
  import { page } from '$app/stores';

  import SearchAttributeFilter from '$lib/components/search-attribute-filter/index.svelte';
  import type { QuickFilter } from '$lib/components/search-attribute-filter/quick-filters.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    hideChildWorkflowsFilter,
    showWorkflowsQuickFilters,
    workflowFilters,
  } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { refresh } from '$lib/stores/workflows';
  import { workflowRoutePattern } from '$lib/utilities/namespace-url-pattern';
  import {
    getFilterIndex,
    toggleFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  $: workflowsPage = workflowRoutePattern.match(window?.location?.pathname);
  $: quickFilters = [
    {
      label: translate('workflows.hide-children'),
      icon: 'eye-hide',
      checked:
        getFilterIndex(hideChildWorkflowsFilter, $workflowFilters) !== -1,
      onClick: () => {
        $workflowFilters = toggleFilter(
          hideChildWorkflowsFilter,
          $workflowFilters,
          $page.url,
        );
      },
    },
  ] as QuickFilter[];
</script>

<div class="flex w-full items-start gap-1">
  {#if $searchInputViewOpen && workflowsPage}
    <Tooltip text={translate('workflows.close-search-input')} topLeft>
      <Button
        data-testid="manual-search-toggle"
        id="close-search-input"
        variant="ghost"
        class="mt-1"
        leadingIcon="filter"
        size="xs"
        on:click={() => ($searchInputViewOpen = false)}
      />
    </Tooltip>
  {/if}
  <SearchAttributeFilter
    showFilter={!$searchInputViewOpen}
    bind:filters={$workflowFilters}
    refresh={() => {
      $refresh = Date.now();
    }}
    {quickFilters}
    showQuickFilters={showWorkflowsQuickFilters}
  >
    {#if $searchInputViewOpen}
      <WorkflowAdvancedSearch />
    {/if}
  </SearchAttributeFilter>
</div>
