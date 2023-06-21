<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import {
    routeForEventHistory,
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
  import AutoRefreshWorkflow from '$lib/components/auto-refresh-workflow.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { has } from '$lib/utilities/has';
  import Link from '$lib/holocene/link.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import { translate } from '$lib/i18n/translate';

  export let namespace: string;

  $: ({ workflow, workers } = $workflowRun);

  let refreshInterval: NodeJS.Timer;
  const refreshRate = 15000;

  $: routeParameters = {
    namespace,
    workflow: workflow?.id,
    run: workflow?.runId,
  };

  $: isRunning = $workflowRun?.workflow?.isRunning;
  $: activitiesCanceled = ['Terminated', 'TimedOut', 'Canceled'].includes(
    $workflowRun.workflow?.status,
  );

  onMount(() => {
    if (isRunning && $autoRefreshWorkflow === 'on') {
      // Auto-refresh of 15 seconds if turned on
      clearInterval(refreshInterval);
      refreshInterval = setInterval(() => ($refresh = Date.now()), refreshRate);
    }
  });

  $: {
    if (!isRunning) {
      // Stop refresh if workflow is no longer running
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

  $: cancelInProgress = isCancelInProgress(
    $workflowRun?.workflow?.status,
    $eventHistory,
  );

  $: workflowHasBeenReset = has($resetWorkflows, $workflowRun?.workflow?.runId);
</script>

<header class="mb-4 flex flex-col gap-1">
  <div class="mb-4 block">
    <a
      href={`${routeForWorkflows({
        namespace,
      })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      class="back-to-workflows"
    >
      <Icon name="chevron-left" class="inline" />
      {translate('workflows', 'back-to-workflows')}
    </a>
  </div>
  <div
    class="mb-8 flex w-full flex-col items-center justify-between gap-4 lg:flex-row"
  >
    <div
      class="flex w-full items-center justify-start gap-4 overflow-hidden whitespace-nowrap lg:w-auto"
    >
      <WorkflowStatus status={workflow?.status} />
      <h1
        data-testid="workflow-id-heading"
        class="overflow-hidden text-2xl font-medium"
      >
        <Copyable
          content={workflow?.id}
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
        <AutoRefreshWorkflow onChange={onRefreshChange} />
        <WorkflowActions {cancelInProgress} {workflow} {namespace} />
      </div>
    {/if}
  </div>
  {#if cancelInProgress}
    <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        bold
        icon="info"
        intent="info"
        title={translate('workflows', 'cancel-request-sent')}
        role="status"
      >
        {translate('workflows', 'cancel-request-sent-description')}
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
        title={translate('workflows', 'reset-success-alert-title')}
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
  <Tabs>
    <TabList class="flex flex-wrap gap-6" label="workflow detail">
      <Tab
        label={translate('workflows', 'history-tab')}
        id="history-tab"
        href={routeForEventHistory({
          ...routeParameters,
        })}
        active={pathMatches(
          $page.url.pathname,
          routeForEventHistory({
            ...routeParameters,
          }),
        )}
      >
        <Badge type="blue" class="px-2 py-0">{workflow?.historyEvents}</Badge>
      </Tab>
      <Tab
        label={translate('workflows', 'workers-tab')}
        id="workers-tab"
        href={routeForWorkers(routeParameters)}
        active={pathMatches(
          $page.url.pathname,
          routeForWorkers(routeParameters),
        )}
      >
        <Badge type="blue" class="px-2 py-0">{workers?.pollers?.length}</Badge>
      </Tab>
      <Tab
        label={translate('workflows', 'pending-activities-tab')}
        id="pending-activities-tab"
        href={routeForPendingActivities(routeParameters)}
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
          {workflow?.pendingActivities?.length}
        </Badge>
      </Tab>
      <Tab
        label={translate('workflows', 'stack-trace-tab')}
        id="stack-trace-tab"
        href={routeForStackTrace(routeParameters)}
        active={pathMatches(
          $page.url.pathname,
          routeForStackTrace(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows', 'queries-tab')}
        id="queries-tab"
        href={routeForWorkflowQuery(routeParameters)}
        active={pathMatches(
          $page.url.pathname,
          routeForWorkflowQuery(routeParameters),
        )}
      />
    </TabList>
  </Tabs>
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
