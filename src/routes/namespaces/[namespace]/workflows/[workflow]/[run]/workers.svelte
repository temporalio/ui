<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Workers | ${workflow}`} url={$page.url.href} />
<WorkflowWorkers />
