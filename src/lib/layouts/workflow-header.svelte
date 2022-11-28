<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  import { autoRefreshWorkflow, eventViewType } from '$lib/stores/event-view';
  import { workflowsSearch } from '$lib/stores/workflows';
  import { workflowRun, refresh } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import {
    routeForEventHistory,
    routeForPendingActivities,
    routeForStackTrace,
    routeForWorkers,
    routeForWorkflowQuery,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import type { GetPollersResponse } from '$lib/services/pollers-service';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import Tab from '$lib/holocene/tab.svelte';
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';
  import AutoRefreshWorkflow from '$lib/components/auto-refresh-workflow.svelte';
  import Alert from '$lib/holocene/alert.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let workers: GetPollersResponse;

  let refreshInterval;
  const refreshRate = 15000;

  $: routeParameters = {
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  };

  const { parameters, searchType } = $workflowsSearch;
  const query = toListWorkflowQuery(parameters);

  $: isRunning = $workflowRun.workflow.isRunning;

  onMount(() => {
    if (isRunning && $autoRefreshWorkflow === 'on') {
      // Auto-refresh of 15 seconds if turned on
      clearInterval(refreshInterval);
      refreshInterval = setInterval(() => ($refresh = Date.now()), refreshRate);
    }
  });

  $: {
    if (!isRunning) {
      // Stop refresh if worfklow is no longer running
      clearInterval(refreshInterval);
    }
  }

  const onRefreshChange = () => {
    if ($autoRefreshWorkflow === 'on') {
      $autoRefreshWorkflow = 'off';
      clearInterval(refreshInterval);
    } else {
      $refresh = Date.now();
      $autoRefreshWorkflow = 'on';
      clearInterval(refreshInterval);
      refreshInterval = setInterval(() => ($refresh = Date.now()), refreshRate);
    }
  };

  onDestroy(() => {
    clearInterval(refreshInterval);
  });

  $: cancelInProgress =
    $workflowRun?.workflow?.status === 'Running' &&
    $eventHistory.events.some(
      (event) => event?.eventType === 'WorkflowExecutionCancelRequested',
    );
</script>

<header class="mb-4 flex flex-col gap-4">
  <main class="relative flex flex-col gap-1">
    <div class="-mt-3 -ml-2 mb-4 block">
      <a
        href={routeForWorkflowsWithQuery({
          namespace,
          query,
          search: searchType,
        })}
        data-cy="back-to-workflows"
        class="back-to-workflows"
      >
        <Icon name="chevron-left" class="inline" />Back to Workflows
      </a>
    </div>
    <div
      class="mb-8 flex flex-col items-center justify-between gap-4 xl:flex-row xl:gap-0"
    >
      <h1
        data-cy="workflow-id-heading"
        class="relative flex items-center gap-4 text-2xl"
      >
        <WorkflowStatus status={workflow?.status} />
        <span class="select-all font-medium">{workflow.id}</span>
      </h1>
      {#if isRunning}
        <div class="flex items-center justify-start gap-4 xl:justify-end">
          <AutoRefreshWorkflow onChange={onRefreshChange} />
          <WorkflowActions {cancelInProgress} {workflow} {namespace} />
        </div>
      {/if}
    </div>
    {#if cancelInProgress}
      <div class="-mt-4 mb-4" transition:fly={{ duration: 200, delay: 100 }}>
        <Alert icon="info" intent="info" title="Cancel Request Sent">
          The request to cancel this Workflow Execution has been sent. If the
          Workflow uses the cancellation API, it'll cancel at the next available
          opportunity.
        </Alert>
      </div>
    {/if}
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
