<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import CompareRunsPage from '$lib/pages/compare-runs.svelte';

  $: namespace = $page.params.namespace;
  $: workflowIdA = $page.url.searchParams.get('a') ?? '';
  $: runIdA = $page.url.searchParams.get('runA') ?? '';
  $: workflowIdB = $page.url.searchParams.get('b') ?? '';
  $: runIdB = $page.url.searchParams.get('runB') ?? '';
</script>

<PageTitle title="Compare Runs" />
<CompareRunsPage {namespace} {workflowIdA} {runIdA} {workflowIdB} {runIdB} />
