<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { page } from '$app/stores';

  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';

  import Tab from '$lib/components/tab.svelte';

  export let workflow: WorkflowExecution;

  const { namespace, workflow: id, run: runId } = $page.params;
  const historyEvents = workflow?.historyEvents;
  const workflowUrl = getWorkflowExecutionUrl(namespace, { id, runId });

  const urlFor = (path: string): string => `${workflowUrl}/${path}`;
</script>

<nav class="flex gap-6">
  <Tab label="History" href={urlFor('history')} amount={historyEvents} />
  <Tab label="Workers" href={urlFor('workers')} />
  <Tab label="Stack Trace" href={urlFor('stack-trace')} />
  <Tab label="Queries" href={urlFor('queries')} />
</nav>
