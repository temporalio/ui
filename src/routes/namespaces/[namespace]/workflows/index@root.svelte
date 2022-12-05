<script lang="ts">
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <WorkflowsWithNewSearch
    bulkActionsEnabled={$supportsBulkActions}
    cancelEnabled
  />
  <Workflows slot="fallback" />
</AdvancedVisibilityGuard>
