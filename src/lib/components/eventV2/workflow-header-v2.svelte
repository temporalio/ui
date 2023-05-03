<script lang="ts">
  import { fly } from 'svelte/transition';

  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import {
    routeForEventHistory,
    routeForEventHistoryV2,
    routeForPendingActivities,
    routeForStackTrace,
    routeForWorkers,
    routeForWorkflowQuery,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/components/copyable.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';
  import Alert from '$lib/holocene/alert.svelte';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { has } from '$lib/utilities/has';
  import Link from '$lib/holocene/link.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import { eventOrGroupIsFailureOrTimedOut } from '$lib/models/event-groups/get-event-in-group';

  export let namespace: string;

  $: ({ workflow, workers } = $workflowRun);

  $: routeParameters = {
    namespace,
    workflow: workflow?.id,
    run: workflow?.runId,
  };

  $: isRunning = $workflowRun?.workflow?.isRunning;
  $: activitiesCanceled = ['Terminated', 'TimedOut', 'Canceled'].includes(
    $workflowRun.workflow?.status,
  );

  $: cancelInProgress = isCancelInProgress(
    $workflowRun?.workflow?.status,
    $eventHistory,
  );

  $: workflowHasBeenReset = has($resetWorkflows, $workflowRun?.workflow.runId);

  $: failure = $workflowRun?.workflow.status === 'Failed';
  $: canceled = $workflowRun?.workflow.status === 'Canceled';
  $: terminated = $workflowRun?.workflow.status === 'Terminated';
</script>

<header class="flex flex-col gap-1">
  <div class="mb-4 block flex justify-between">
    <a
      href={`${routeForWorkflows({
        namespace,
      })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      class="back-to-workflows"
    >
      <Icon name="chevron-left" class="inline" />Back to Workflows
    </a>
    <!-- <a
      href={`${routeForEventHistoryV2({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
      })}?${$workflowsSearchParams}`}
      data-testid="history-v2"
      class="back-to-workflows"
    >
      Switch to v2 Workflow UI
    </a> -->
  </div>
  <Tabs class="mb-4">
    <TabList class="flex flex-wrap gap-6" label="workflow detail">
      <Tab
        label="History"
        href={routeForEventHistoryV2({
          ...routeParameters,
        })}
        id="history-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForEventHistoryV2({
            ...routeParameters,
          }),
        )}
      >
        <Badge type="blue" class="px-2 py-0">{workflow.historyEvents}</Badge>
      </Tab>
      <Tab
        label="Workers"
        href={routeForWorkers(routeParameters)}
        id="workers-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForWorkers(routeParameters),
        )}
      >
        <Badge type="blue" class="px-2 py-0">{workers?.pollers?.length}</Badge>
      </Tab>
      <Tab
        label="Pending Activities"
        href={routeForPendingActivities(routeParameters)}
        id="pending-activities-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForPendingActivities(routeParameters),
        )}
      >
        <Badge type={activitiesCanceled ? 'warning' : 'blue'} class="px-2 py-0">
          {#if activitiesCanceled}<Icon
              name="canceled"
              width={20}
              height={20}
            />
          {/if}
          {workflow.pendingActivities?.length}
        </Badge>
      </Tab>
      <Tab
        label="Stack Trace"
        href={routeForStackTrace(routeParameters)}
        id="stack-trace-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForStackTrace(routeParameters),
        )}
      />
      <Tab
        label="Queries"
        href={routeForWorkflowQuery(routeParameters)}
        id="queries-tab"
        active={pathMatches(
          $page.url.pathname,
          routeForWorkflowQuery(routeParameters),
        )}
      />
    </TabList>
  </Tabs>

  <div
    class="flex w-full flex-col items-center justify-between gap-4 lg:flex-row"
  >
    <div
      class="flex w-full items-center justify-start gap-4 overflow-hidden whitespace-nowrap lg:w-auto"
    >
      <h1
        data-testid="workflow-id-heading"
        class="overflow-hidden text-2xl font-medium"
      >
        <Copyable
          content={workflow?.type}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis"
        />
      </h1>
    </div>
    {#if isRunning}
      <div
        class="flex flex-col items-center justify-center gap-4 whitespace-nowrap sm:flex-row lg:justify-end"
      >
        <WorkflowActions {cancelInProgress} {workflow} {namespace} />
      </div>
    {/if}
  </div>
  <div
    class="flex w-full items-center justify-start gap-2 overflow-hidden whitespace-nowrap"
  >
    <h3
      data-testid="workflow-id-heading"
      class="overflow-hidden text-sm flex gap-2 items-center"
    >
      Workflow Id:
      <Copyable
        content={workflow?.id}
        clickAllToCopy
        container-class="w-full"
        class="overflow-hidden text-ellipsis"
      />
    </h3>
    <h3
      data-testid="workflow-run-id-heading"
      class="overflow-hidden text-sm flex gap-2 items-center"
    >
      Run Id:
      <Copyable
        content={workflow?.runId}
        clickAllToCopy
        container-class="w-full"
        class="overflow-hidden text-ellipsis"
      />
    </h3>
  </div>
  <div
    class="flex w-full items-center justify-start gap-4 overflow-hidden whitespace-nowrap lg:w-auto"
  >
    <WorkflowStatus status={workflow?.status} />
    <Badge type="green" class="flex gap-1 py-0"
      ><Icon name="task-queue" />{workflow.taskQueue}</Badge
    >
  </div>

  {#if cancelInProgress}
    <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        bold
        icon="info"
        intent="info"
        title="Cancel Request Sent"
        role="status"
      >
        The request to cancel this Workflow Execution has been sent. If the
        Workflow uses the cancellation API, it'll cancel at the next available
        opportunity.
      </Alert>
    </div>
  {/if}
  {#if workflowHasBeenReset}
    <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        bold
        icon="info"
        intent="info"
        data-testid="workflow-reset-alert"
        title="This Workflow has been reset"
        role="status"
      >
        You can find the resulting Workflow Execution <Link
          href={routeForEventHistory({
            namespace,
            workflow: $workflowRun?.workflow?.id,
            run: $resetWorkflows[$workflowRun?.workflow?.runId],
          })}>here</Link
        >.
      </Alert>
    </div>
  {/if}
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

  .failure {
    @apply bg-red-50 border-2 rounded-xl border-red-300;
  }

  .canceled {
    @apply bg-yellow-50 border-2 rounded-xl border-yellow-300;
  }

  .terminated {
    @apply bg-pink-50 border-2 rounded-xl border-pink-300;
  }
</style>
