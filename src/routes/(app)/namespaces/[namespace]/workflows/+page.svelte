<script lang="ts">
  import { page } from '$app/stores';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';

  import type { PageServerData } from './$types';

  export let data: PageServerData;
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <WorkflowsWithNewSearch workflows={data.workflows.workflows} />
  <Workflows slot="fallback" />
</AdvancedVisibilityGuard>
