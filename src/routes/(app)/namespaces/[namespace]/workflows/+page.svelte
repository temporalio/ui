<script lang="ts">
  import { page } from '$app/stores';

  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';
  import Workflows from '$lib/pages/workflows.svelte';
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <WorkflowsWithNewSearch />
  <Workflows slot="fallback" />
</AdvancedVisibilityGuard>
