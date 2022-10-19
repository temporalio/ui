<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle title={`Workers | ${$page.params?.workflow}`} url={$page.url.href} />
<WorkflowWorkers />
