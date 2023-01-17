<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Query | ${workflow}`} url={$page.url.href} />
<WorkflowQuery />
