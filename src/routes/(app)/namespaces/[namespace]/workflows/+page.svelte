<script lang="ts">
  import { page } from '$app/stores';
  import { settings } from '$lib/stores/settings';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';

  $: bulkActionsEnabled =
    $supportsBulkActions &&
    (!$settings.workflowCancelDisabled || !$settings.workflowTerminateDisabled);
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <WorkflowsWithNewSearch
    {bulkActionsEnabled}
    cancelEnabled={!$settings.workflowCancelDisabled}
    terminateEnabled={!$settings.workflowTerminateDisabled}
  />
  <Workflows slot="fallback" />
</AdvancedVisibilityGuard>
