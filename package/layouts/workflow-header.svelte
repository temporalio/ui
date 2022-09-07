<script>import Icon from '$holocene/icon/icon.svelte';
import { eventViewType } from '../stores/event-view';
import { workflowsSearch } from '../stores/workflows';
import { toListWorkflowQuery } from '../utilities/query/list-workflow-query';
import { routeForEventHistory, routeForPendingActivities, routeForStackTrace, routeForWorkers, routeForWorkflowQuery, } from '../utilities/route-for';
import WorkflowStatus from '../components/workflow-status.svelte';
import TerminateWorkflow from '../components/terminate-workflow.svelte';
import ExportHistory from '../components/export-history.svelte';
import Tab from '../holocene/tab.svelte';
import { encodeURIForSvelte } from '../utilities/encode-uri';
import { page } from '$app/stores';
import { pathMatches } from '../utilities/path-matches';
export let namespace;
export let workflow;
export let workers;
const routeParameters = {
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
};
const { parameters, searchType } = $workflowsSearch;
const query = toListWorkflowQuery(parameters);
</script>

<header class="mb-4 flex flex-col gap-4">
  <main class="relative flex flex-col gap-1">
    <div class="-mt-3 -ml-2 block">
      <a
        href={`/namespaces/${namespace}/workflows?query=${encodeURIForSvelte(
          query,
        )}&search=${searchType}`}
        data-cy="back-to-workflows"
        class="back-to-workflows"
      >
        <Icon name="chevron-left" class="inline" />Back to Workflows
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
        active={pathMatches(
          $page.url.pathname,
          routeForEventHistory({
            view: $eventViewType,
            ...routeParameters,
          }),
        )}
      />
      <Tab
        label="Workers"
        href={routeForWorkers(routeParameters)}
        amount={workers?.pollers?.length}
        dataCy="workers-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForWorkers(routeParameters),
        )}
      />
      <Tab
        label="Pending Activities"
        href={routeForPendingActivities(routeParameters)}
        amount={workflow.pendingActivities?.length}
        dataCy="pending-activities-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForPendingActivities(routeParameters),
        )}
      />
      <Tab
        label="Stack Trace"
        href={routeForStackTrace(routeParameters)}
        dataCy="stack-trace-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForStackTrace(routeParameters),
        )}
      />
      <Tab
        label="Queries"
        href={routeForWorkflowQuery(routeParameters)}
        dataCy="queries-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForWorkflowQuery(routeParameters),
        )}
      />
    </nav>
  </main>
</header>

<style>
  .back-to-workflows {
    font-size: 0.875rem;
    line-height: 1.25rem;
}

  .back-to-workflows:hover {
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity));
    -webkit-text-decoration-line: underline;
            text-decoration-line: underline;
}

  .back-to-workflows:hover :global(svg path) {
    stroke: #1d4ed8;
  }</style>
