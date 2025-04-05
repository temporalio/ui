<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';
</script>

<PageTitle
  title={`Workflows | ${$page.params.namespace}`}
  url={$page.url.href}
/>

<WorkflowsWithNewSearch />
