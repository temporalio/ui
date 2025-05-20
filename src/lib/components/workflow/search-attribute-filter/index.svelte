<script lang="ts">
  import SearchAttributeFilter from '$lib/components/search-attribute-filter/index.svelte';
  import WorkflowTypeaheadSearch from '$lib/components/workflow/workflow-typeahead-search.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { refresh } from '$lib/stores/workflows';
  import { workflowRoutePattern } from '$lib/utilities/namespace-url-pattern';

  $: workflowsPage = workflowRoutePattern.match(window?.location?.pathname);
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
  >
    {#if $searchInputViewOpen}
      <WorkflowTypeaheadSearch />
    {/if}
  </SearchAttributeFilter>
</div>
