<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowQuery from '$lib/pages/workflow-query.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle title={`Query | ${$page.params?.workflow}`} url={$page.url.href} />
<WorkflowQuery />
