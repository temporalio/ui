<script lang="ts">
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';
  import { bulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
  import WorkflowsImagination from '$lib/pages/imagination/workflows-imagination.svelte';
  import WorkflowsDashboard from '$lib/pages/imagination/workflows-dashboard.svelte';
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <WorkflowsDashboard />
  <!-- <WorkflowsWithNewSearch
    bulkActionsEnabled={bulkActionsEnabled(
      $page.data.settings,
      $supportsAdvancedVisibility,
    )}
    cancelEnabled={workflowCancelEnabled($page.data.settings)}
    terminateEnabled={workflowTerminateEnabled($page.data.settings)}
  />
  <Workflows slot="fallback" /> -->
</AdvancedVisibilityGuard>
