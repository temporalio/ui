<script lang="ts">
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import { bulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
  import WorkflowsDashboard from '$lib/pages/imagination/workflows-dashboard.svelte';
  import WorkflowsDashboardHeader from '$lib/pages/imagination/workflows-dashboard-header.svelte';
  import WorkflowsLiveFeed from '$lib/pages/imagination/workflows-live-feed.svelte';
  import WorkflowsLiveFeedHeader from '$lib/pages/imagination/workflows-live-feed-header.svelte';
  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import WorkflowAdvancedFilters from '$lib/components/workflow/workflow-advanced-filters.svelte';
  import WorkflowsLiveFeedAdvancedSearch from '$lib/pages/imagination/workflows-live-feed-advanced-search.svelte';

  $: searchView = getSearchType($page.url);
  $: basicView = searchView === 'basic';

  const updateSearchType = (searchType: 'basic' | 'advanced') => {
    $page.url.searchParams.delete('query');
    $page.url.searchParams.delete('page');

    updateQueryParameters({
      parameter: 'search',
      value: searchType,
      url: $page.url,
    });
  };
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>
{#if basicView}
  <WorkflowsDashboard>
    <WorkflowsDashboardHeader onClick={() => updateSearchType('advanced')} />
  </WorkflowsDashboard>
{:else}
  <AdvancedVisibilityGuard>
    <WorkflowsLiveFeed
      bulkActionsEnabled={bulkActionsEnabled(
        $page.data.settings,
        $supportsAdvancedVisibility,
      )}
      cancelEnabled={workflowCancelEnabled($page.data.settings)}
      terminateEnabled={workflowTerminateEnabled($page.data.settings)}
    >
      <WorkflowsLiveFeedHeader onClick={() => updateSearchType('basic')} />
      <WorkflowsLiveFeedAdvancedSearch />
    </WorkflowsLiveFeed>
    <Workflows slot="fallback" />
  </AdvancedVisibilityGuard>
{/if}
