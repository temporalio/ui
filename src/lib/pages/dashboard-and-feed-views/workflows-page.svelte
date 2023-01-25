<script lang="ts">
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import { bulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
  import WorkflowsDashboard from '$lib/pages/dashboard-and-feed-views/workflows-dashboard.svelte';
  import WorkflowsDashboardHeader from '$lib/pages/dashboard-and-feed-views/workflows-dashboard-header.svelte';
  import WorkflowsLiveFeed from '$lib/pages/dashboard-and-feed-views/workflows-live-feed.svelte';
  import WorkflowsLiveFeedHeader from '$lib/pages/dashboard-and-feed-views/workflows-live-feed-header.svelte';
  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { workflowsSearch } from '$lib/stores/workflows';

  $: namespace = $page.params.namespace;
  $: searchType = getSearchType($page.url);
  $: basicView = searchType === 'basic';

  const updateSearchType = (value: 'basic' | 'advanced') => {
    $page.url.searchParams.delete('query');
    $page.url.searchParams.delete('page');

    updateQueryParameters({
      parameter: 'search',
      value,
      url: $page.url,
    });
  };

  onDestroy(() => {
    const query = $page.url.searchParams.get('query');
    const parameters = query ? toListWorkflowParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
  });
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

{#key namespace}
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
      </WorkflowsLiveFeed>
      <Workflows slot="fallback" />
    </AdvancedVisibilityGuard>
  {/if}
{/key}
