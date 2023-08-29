<script lang="ts">
  import { fly } from 'svelte/transition';

  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/stores';

  import AutoRefreshWorkflow from '$lib/components/auto-refresh-workflow.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import Copyable from '$lib/holocene/copyable.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { autoRefreshWorkflow } from '$lib/stores/event-view';
  import { eventHistory } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { has } from '$lib/utilities/has';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForEventHistory,
    routeForPendingActivities,
    routeForStackTrace,
    routeForWorkers,
    routeForWorkflowQuery,
    routeForWorkflows,
  } from '$lib/utilities/route-for';
  import {
    getCurrentCompatibilityDefaultVersion,
    getCurrentWorkflowBuildId,
    getDefaultVersionForSetFromABuildId,
  } from '$lib/utilities/task-queue-compatibility';

  export let namespace: string;

  $: ({ workflow, workers, compatibility } = $workflowRun);

  let refreshInterval: ReturnType<typeof setInterval>;
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

  $: workflowUsesVersioning =
    workflow?.mostRecentWorkerVersionStamp?.useVersioning;
  $: buildId = getCurrentWorkflowBuildId(workflow);
  $: overallDefaultVersion =
    getCurrentCompatibilityDefaultVersion(compatibility);
  $: defaultVersionForSet = getDefaultVersionForSetFromABuildId(
    compatibility,
    buildId,
  );
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
      class="flex flex-col w-full justify-start gap-4 overflow-hidden whitespace-nowrap lg:w-auto"
    >
      <h1
        data-testid="workflow-id-heading"
        class="overflow-hidden text-2xl font-medium"
      >
        <Copyable
          copyIconTitle={translate('copy-icon-title')}
          copySuccessIconTitle={translate('copy-success-icon-title')}
          content={workflow?.id}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis"
        />
      </h1>
      <div class="flex gap-4 items-center flex-wrap">
        <WorkflowStatus status={workflow?.status} />
        {#if workflowUsesVersioning}
          <p class="flex gap-1 items-center">
            <span>{translate('workers', 'last-used-version')}</span
            ><CompatibilityBadge
              defaultVersion={buildId === defaultVersionForSet ||
                buildId === overallDefaultVersion}
              active={buildId === overallDefaultVersion}
              {buildId}
            >
              <svelte:fragment slot="overall-default-worker">
                {#if buildId === overallDefaultVersion}{translate(
                    'workers',
                    'overall',
                  )}{/if}
              </svelte:fragment>
              <svelte:fragment slot="default-worker">
                {translate('workers', 'default')}
              </svelte:fragment>
            </CompatibilityBadge>
          </p>
          <p class="flex gap-1 items-center">
            <span>{translate('workers', 'next-version')}</span
            ><CompatibilityBadge
              defaultVersion={!!defaultVersionForSet}
              active={defaultVersionForSet === overallDefaultVersion}
              buildId={defaultVersionForSet}
            >
              <svelte:fragment slot="overall-default-worker">
                {#if defaultVersionForSet === overallDefaultVersion}{translate(
                    'workers',
                    'overall',
                  )}{/if}
              </svelte:fragment>
              <svelte:fragment slot="default-worker">
                {translate('workers', 'default')}
              </svelte:fragment>
            </CompatibilityBadge>
          </p>
        {/if}
      </div>
    </div>
    <div
      class="flex flex-col items-center justify-center gap-4 whitespace-nowrap sm:flex-row lg:justify-end"
    >
      {#if isRunning}
        <AutoRefreshWorkflow onChange={onRefreshChange} />
      {/if}
      <WorkflowActions {isRunning} {cancelInProgress} {workflow} {namespace} />
    </div>
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
