<script lang="ts">
  import Icon from 'holocene/components/icon/index.svelte';

  import { eventViewType } from '$lib/stores/event-view';

  import {
    routeForEventHistory,
    routeForPendingActivities,
    routeForStackTrace,
    routeForWorkers,
    routeForWorkflowQuery,
  } from '$lib/utilities/route-for';

  import type { GetPollersResponse } from '$lib/services/pollers-service';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';
  import ExportHistory from '$lib/components/export-history.svelte';
  import Tab from '$lib/components/tab.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

  const routeParameters = {
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  };
</script>

<header class="flex flex-col gap-4">
  <main class="flex flex-col gap-1 relative">
    <div class="block -mt-3 -ml-2">
      <a href="/namespaces/{namespace}/workflows" class="back-to-workflows">
        <Icon name="caretLeft" class="inline" color="black" />Back to Workflows
      </a>
    </div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl flex relative items-center gap-4">
        <WorkflowStatus status={workflow?.status} />
        <span class="font-medium select-all">{workflow.id}</span>
      </h1>
      <div class="ml-8 flex justify-end items-center gap-4">
        <ExportHistory
          {namespace}
          workflowId={workflow.id}
          runId={workflow.runId}
        />
        <TerminateWorkflow {workflow} {namespace} />
      </div>
    </div>
    <nav class="flex gap-6 flex-wrap">
      <Tab
        label="History"
        href={routeForEventHistory({
          view: $eventViewType,
          ...routeParameters,
        })}
        amount={workflow?.historyEvents}
        dataCy="history-tab"
      />
      <Tab
        label="Workers"
        href={routeForWorkers(routeParameters)}
        amount={workers?.pollers?.length}
        dataCy="workers-tab"
      />
      <Tab
        label="Pending Activities"
        href={routeForPendingActivities(routeParameters)}
        amount={workflow.pendingActivities?.length}
        dataCy="pending-activities-tab"
      />
      <Tab
        label="Stack Trace"
        href={routeForStackTrace(routeParameters)}
        dataCy="stack-trace-tab"
      />
      <Tab
        label="Queries"
        href={routeForWorkflowQuery(routeParameters)}
        dataCy="queries-tab"
      />
    </nav>
  </main>
</header>

<style lang="postcss">
  .back-to-workflows {
    @apply text-sm;
  }

  .back-to-workflows:hover {
    @apply text-blue-700 underline;
  }

  .back-to-workflows:hover :global(svg path) {
    stroke: #1d4ed8;
  }
</style>
