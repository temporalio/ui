<script>import { page } from '$app/stores';
import { workflowRun } from '../stores/workflow-run';
import PageTitle from '../holocene/page-title.svelte';
import WorkersList from '../components/workers-list.svelte';
const { workers, workflow } = $workflowRun;
</script>

<PageTitle title={`Workers | ${workflow.id}`} url={$page.url.href} />
<WorkersList taskQueue={workflow.taskQueue} {workers} />
