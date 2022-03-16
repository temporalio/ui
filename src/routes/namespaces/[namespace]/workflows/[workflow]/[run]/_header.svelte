<script lang="ts">
  import { page } from '$app/stores';
  import Icon from 'svelte-fa';
  import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

  import { routeFor } from '$lib/utilities/route-for';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';
  import Tab from '$lib/components/tab.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;

  const { workflow: workflowId, run: runId } = $page.params;
  const historyEvents = workflow?.historyEvents;
</script>

<header class="flex flex-col gap-4">
  <main class="flex flex-col gap-1 relative">
    <a
      href="/namespaces/{namespace}/workflows"
      class="absolute top-2 back-to-workflows"
      style="left: -1.5rem"
    >
      <Icon icon={faChevronLeft} />
    </a>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl">
        {workflow.name}
        <WorkflowStatus status={workflow?.status} />
      </h1>
      <TerminateWorkflow {workflow} {namespace} />
    </div>
    <p class="text-md">
      <span>Workflow ID</span>
      <span class="font-medium">{workflow.id}</span>
    </p>
    <p class="text-md">
      <span>Run ID</span>
      <span class="font-medium">{workflow.runId}</span>
    </p>
  </main>
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
</header>
