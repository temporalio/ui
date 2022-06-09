<script lang="ts">
  import Icon from 'holocene/components/icon/index.svelte';

  import { eventViewType } from '$lib/stores/event-view';
  import { workflowsSearch } from '$lib/stores/workflows';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

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
  import { encodeURIForSvelte } from '$lib/utilities/encode-uri';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

  const routeParameters = {
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  };

  const { parameters, searchType } = $workflowsSearch;
  const query = toListWorkflowQuery(parameters);
</script>

<header class="flex flex-col gap-4">
  <main class="relative flex flex-col gap-1">
    <div class="-mt-3 -ml-2 block">
      <a
        href={`/namespaces/${namespace}/workflows?query=${encodeURIForSvelte(
          query,
        )}&search=${searchType}`}
        data-cy="back-to-workflows"
        class="back-to-workflows"
      >
        <Icon name="caretLeft" class="inline" />Back to Workflows
      </a>
    </div>
    <div class="mb-8 flex items-center justify-between">
      <h1 class="relative flex items-center gap-4 text-2xl">
        <WorkflowStatus status={workflow?.status} />
        <span class="select-all font-medium">{workflow.id}</span>
      </h1>
      <div class="ml-8 flex items-center justify-end gap-4">
        <ExportHistory
          {namespace}
          workflowId={workflow.id}
          runId={workflow.runId}
        />
        <TerminateWorkflow {workflow} {namespace} />
      </div>
    </div>
    <nav class="flex flex-wrap gap-6">
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
