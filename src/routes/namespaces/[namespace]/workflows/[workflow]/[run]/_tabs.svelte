<script lang="ts">
  import { page } from '$app/stores';
  import { routeFor } from '$lib/utilities/route-for';

  import Tab from '$lib/components/tab.svelte';

  export let workflow: WorkflowExecution;

  const { namespace, workflow: workflowId, run: runId } = $page.params;
  const historyEvents = workflow?.historyEvents;
</script>

<nav class="flex gap-6">
  <Tab
    label="History"
    href={routeFor('workflow.events', { namespace, workflowId, runId })}
    amount={historyEvents}
  />
  <Tab
    label="Workers"
    href={routeFor('workers', { namespace, workflowId, runId })}
  />
  <Tab
    label="Stack Trace"
    href={routeFor('workflow.stack-trace', { namespace, workflowId, runId })}
  />
  <Tab
    label="Query"
    href={routeFor('workflow.query', { namespace, workflowId, runId })}
  />
</nav>
