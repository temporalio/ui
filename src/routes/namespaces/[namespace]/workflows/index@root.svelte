<script lang="ts">
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';

  const isCloud = $page.stuff?.settings?.runtimeEnvironment?.isCloud;
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <WorkflowsWithNewSearch
    bulkActionsEnabled={$supportsBulkActions}
    cancelEnabled={!isCloud}
  />
  <Workflows slot="fallback" />
</AdvancedVisibilityGuard>
