<script lang="ts">
  import { page } from '$app/stores';
  import { userSettings } from '$lib/stores/user-settings';
  import { CoreUserEmbeddedContent } from '$lib/models/core-user';

  import Workflows from '$lib/pages/workflows.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  import AdvancedVisibilityGuard from '$lib/components/advanced-visibility-guard.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';
  import EmbeddedContentSlotGuard from '$lib/components/embedded-content-slot-guard.svelte';
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<AdvancedVisibilityGuard>
  <EmbeddedContentSlotGuard page="WORKFLOWS">
    <WorkflowsWithNewSearch />
  </EmbeddedContentSlotGuard>
  <Workflows slot="fallback" />
</AdvancedVisibilityGuard>
