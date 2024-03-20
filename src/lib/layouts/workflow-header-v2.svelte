<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CompatibilityBadge from '$lib/holocene/compatibility-badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import { has } from '$lib/utilities/has';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForCallStack,
    routeForEventHistory,
    routeForRelationships,
    routeForWorkers,
    routeForWorkflowMetadata,
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
  $: id = $page.params.id;

  $: routeParameters = {
    namespace,
    workflow: workflow?.id,
    run: workflow?.runId,
  };

  $: isRunning = $workflowRun?.workflow?.isRunning;
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
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
</script>

<div class="bg-slate-950 px-4 text-white">
  <div class=" pb-2 pt-16">
    <Link
      href={`${routeForWorkflows({
        namespace,
      })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      icon="chevron-left"
    >
      {id
        ? translate('common.workflows')
        : translate('workflows.back-to-workflows')}
    </Link>
    {#if id}
      <Link
        href={routeForEventHistory({
          ...routeParameters,
        })}
        data-testid="back-to-workflow-execution"
        icon="chevron-left"
      >
        {workflow?.runId}
      </Link>
    {/if}
  </div>
  <header class="rounded-top flex flex-col gap-0 bg-slate-950 text-white">
    <div class="flex flex-col items-center justify-between gap-4 lg:flex-row">
      <div class="flex flex-col items-center gap-4 lg:flex-row">
        <div class="px-2">
          <WorkflowStatus status={workflow?.status} big />
        </div>
        <div class="flex flex-col flex-wrap gap-0">
          <h1
            data-testid="workflow-id-heading"
            class="overflow-hidden text-base font-medium lg:text-2xl"
          >
            <Copyable
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
              content={workflow?.id}
              clickAllToCopy
              container-class="w-full"
              class="overflow-hidden text-ellipsis"
            />
          </h1>
          {#if workflowUsesVersioning}
            <p class="flex items-center gap-1">
              <span>{translate('workers.last-used-version')}</span
              ><CompatibilityBadge
                defaultVersion={buildId === defaultVersionForSet ||
                  buildId === overallDefaultVersion}
                active={buildId === overallDefaultVersion}
                {buildId}
              >
                <svelte:fragment slot="overall-default-worker">
                  {#if buildId === overallDefaultVersion}{translate(
                      'workers.overall',
                    )}{/if}
                </svelte:fragment>
                <svelte:fragment slot="default-worker">
                  {translate('workers.default')}
                </svelte:fragment>
              </CompatibilityBadge>
            </p>
            <p class="flex items-center gap-1">
              <span>{translate('workers.next-version')}</span
              ><CompatibilityBadge
                defaultVersion={!!defaultVersionForSet}
                active={defaultVersionForSet === overallDefaultVersion}
                buildId={defaultVersionForSet}
              >
                <svelte:fragment slot="overall-default-worker">
                  {#if defaultVersionForSet === overallDefaultVersion}{translate(
                      'workers.overall',
                    )}{/if}
                </svelte:fragment>
                <svelte:fragment slot="default-worker">
                  {translate('workers.default')}
                </svelte:fragment>
              </CompatibilityBadge>
            </p>
          {/if}
        </div>
      </div>
      <div class="px-2">
        <WorkflowActions
          {isRunning}
          {cancelInProgress}
          {workflow}
          {namespace}
        />
      </div>
    </div>
    <Tabs>
      <TabList
        class="flex flex-wrap gap-6 bg-slate-950 p-4 text-white"
        label="workflow detail"
      >
        <Tab
          label={translate('workflows.history-tab')}
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
          <Badge type="ultraviolet" class="px-2 py-0"
            >{workflow?.historyEvents}</Badge
          >
        </Tab>
        <Tab
          label={translate('workflows.workers-tab')}
          id="workers-tab"
          href={routeForWorkers(routeParameters)}
          active={pathMatches(
            $page.url.pathname,
            routeForWorkers(routeParameters),
          )}
        >
          <Badge type="ultraviolet" class="px-2 py-0"
            >{workers?.pollers?.length}</Badge
          >
        </Tab>
        <Tab
          label={translate('workflows.relationships')}
          id="relationships-tab"
          href={routeForRelationships(routeParameters)}
          active={pathMatches(
            $page.url.pathname,
            routeForRelationships(routeParameters),
          )}
        >
          <Badge type="ultraviolet" class="px-2 py-0"
            >{workflowRelationships.relationshipCount}</Badge
          >
        </Tab>
        <Tab
          label={translate('workflows.call-stack-tab')}
          id="call-stack-tab"
          href={routeForCallStack(routeParameters)}
          active={pathMatches(
            $page.url.pathname,
            routeForCallStack(routeParameters),
          )}
        />
        <Tab
          label={translate('workflows.queries-tab')}
          id="queries-tab"
          href={routeForWorkflowQuery(routeParameters)}
          active={pathMatches(
            $page.url.pathname,
            routeForWorkflowQuery(routeParameters),
          )}
        />
        <Tab
          label={translate('workflows.metadata-tab')}
          id="metadata-tab"
          href={routeForWorkflowMetadata(routeParameters)}
          active={pathMatches(
            $page.url.pathname,
            routeForWorkflowMetadata(routeParameters),
          )}
        />
      </TabList>
    </Tabs>

    {#if cancelInProgress}
      <div in:fly={{ duration: 200, delay: 100 }}>
        <Alert
          bold
          icon="info"
          intent="info"
          title={translate('workflows.cancel-request-sent')}
        >
          {translate('workflows.cancel-request-sent-description')}
        </Alert>
      </div>
    {/if}
    {#if workflowHasBeenReset}
      <div in:fly={{ duration: 200, delay: 100 }}>
        <Alert
          bold
          icon="info"
          intent="info"
          data-testid="workflow-reset-alert"
          title={translate('workflows.reset-success-alert-title')}
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
</div>
