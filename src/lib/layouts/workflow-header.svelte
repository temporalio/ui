<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getInboundNexusLinkEvents } from '$lib/runes/inbound-nexus-links.svelte';
  import { getWorkflowPollersWithVersions } from '$lib/runes/workflow-versions.svelte';
  import { fullEventHistory } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getSharedFilterParams } from '$lib/utilities/event-filter-params';
  import {
    getWorkflowNexusLinksFromHistory,
    getWorkflowRelationships,
  } from '$lib/utilities/get-workflow-relationships';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForCallStack,
    routeForEventHistory,
    routeForNexusLinks,
    routeForPendingActivities,
    routeForRelationships,
    routeForTimeline,
    routeForUserMetadata,
    routeForWorkers,
    routeForWorkflowMemo,
    routeForWorkflowQuery,
    routeForWorkflows,
    routeForWorkflowSearchAttributes,
  } from '$lib/utilities/route-for';
  import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

  const {
    namespace,
    workflow: workflowId,
    run: runId,
    id: eventId,
  } = $derived(page.params);
  const { workflow, workers } = $derived($workflowRun);
  const routeParameters = $derived({
    namespace,
    workflow: workflowId,
    run: runId,
  });

  const isRunning = $derived(workflow?.isRunning);
  const activitiesCanceled = $derived(
    Boolean(
      workflow?.status &&
      ['Terminated', 'TimedOut', 'Canceled'].includes(workflow.status),
    ),
  );
  const cancelInProgress = $derived(
    Boolean(
      workflow?.status &&
      isCancelInProgress(workflow.status, $fullEventHistory),
    ),
  );
  const isPaused = $derived(workflow?.isPaused);
  const resetRunId = $derived(
    workflow
      ? workflow.workflowExtendedInfo?.resetRunId ||
          $resetWorkflows[workflow.runId]
      : undefined,
  );
  const workflowHasBeenReset = $derived(!!resetRunId);
  const workflowRelationships = $derived(
    getWorkflowRelationships(workflow, $fullEventHistory, page.data.namespace),
  );
  const workflowsHref = $derived(
    `${routeForWorkflows({
      namespace,
    })}?${$workflowsSearchParams}`,
  );
  const outboundLinks = $derived(
    getWorkflowNexusLinksFromHistory($fullEventHistory)?.length || 0,
  );
  const inboundLinks = $derived(
    getInboundNexusLinkEvents($fullEventHistory)?.length || 0,
  );
  const linkCount = $derived(outboundLinks + inboundLinks);
  const sharedFilterParams = $derived(getSharedFilterParams(page.url));
</script>

<div class="flex items-center justify-between">
  <div class="flex items-center gap-2">
    <Link
      href={workflowsHref}
      data-testid="back-to-workflows"
      icon="chevron-left"
    >
      {eventId
        ? translate('common.workflows')
        : translate('workflows.back-to-workflows')}
    </Link>
    {#if eventId}
      <Link
        href={routeForEventHistory({
          ...routeParameters,
        })}
        data-testid="back-to-workflow-execution"
        icon="chevron-left"
      >
        {runId}
      </Link>
    {/if}
  </div>
</div>
<header class="flex flex-col gap-4">
  <div class="flex flex-col items-center justify-between gap-4 xl:flex-row">
    <div
      class="flex w-full flex-col items-start gap-4 xl:flex-row xl:items-center"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-4 max-xl:w-full"
      >
        <WorkflowStatus
          status={workflow?.status}
          big
          delayed={isWorkflowDelayed(workflow)}
          taskFailure={isWorkflowTaskFailure(workflow)}
        />
        <div class="xl:hidden">
          <WorkflowActions
            {isRunning}
            {isPaused}
            {cancelInProgress}
            {workflow}
            {namespace}
            first={workflowRelationships.first}
            next={workflowRelationships.next}
          />
        </div>
      </div>
      <div class="flex flex-col flex-wrap gap-0">
        <h1
          data-testid="workflow-id-heading"
          class="gap-0 overflow-hidden max-sm:text-xl sm:max-md:text-2xl"
        >
          <Copyable
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            content={workflowId}
            clickAllToCopy
            container-class="w-full"
            class="overflow-hidden text-ellipsis text-left"
          />
        </h1>
      </div>
    </div>
    <div class="max-xl:hidden">
      <WorkflowActions
        {isRunning}
        {isPaused}
        {cancelInProgress}
        {workflow}
        {namespace}
        first={workflowRelationships.first}
        next={workflowRelationships.next}
      />
    </div>
  </div>
  <CodecServerErrorBanner />
  <WorkflowDetails {workflow} next={workflowRelationships.next} />
  {#if cancelInProgress}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        icon="info"
        intent="info"
        title={translate('workflows.cancel-request-sent')}
        class="max-w-screen-lg xl:w-2/3"
      >
        {translate('workflows.cancel-request-sent-description')}
      </Alert>
    </div>
  {/if}
  {#if isPaused}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        icon="info"
        intent="info"
        title={translate('workflows.workflow-paused')}
        class="max-w-screen-lg xl:w-2/3"
        data-testid="workflow-paused-alert"
      >
        <div class="mt-2 flex flex-col gap-2">
          <p>{translate('workflows.workflow-paused-description')}</p>
          <ul class="list-disc pl-6">
            <li>{translate('workflows.workflow-pause-description-item-1')}</li>
            <li>{translate('workflows.workflow-pause-description-item-2')}</li>
            <li>{translate('workflows.workflow-pause-description-item-3')}</li>
          </ul>
          {#if workflow?.workflowExtendedInfo?.pauseInfo?.reason}
            <div>
              <p>{translate('workflows.workflow-paused-reason')}</p>
              <p class="text-secondary">
                {workflow.workflowExtendedInfo.pauseInfo.reason} • {$timestamp(
                  workflow.workflowExtendedInfo.pauseInfo.pausedTime,
                )}
              </p>
            </div>
          {/if}
        </div>
      </Alert>
    </div>
  {/if}
  {#if workflowHasBeenReset}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        icon="info"
        intent="info"
        data-testid="workflow-reset-alert"
        title={translate('workflows.reset-success-alert-title')}
        class="max-w-screen-lg xl:w-2/3"
      >
        You can find the resulting Workflow Execution <Link
          href={routeForEventHistory({
            namespace,
            workflow: workflowId,
            run: resetRunId,
          })}>here</Link
        >.
      </Alert>
    </div>
  {/if}
  <Tabs>
    <TabList label="workflow detail">
      <Tab
        label={translate('workflows.timeline-tab')}
        id="timeline-tab"
        href={routeForTimeline({
          ...routeParameters,
          queryParams: sharedFilterParams,
        })}
        active={pathMatches(
          page.url.pathname,
          routeForTimeline(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.history-tab')}
        id="history-tab"
        href={routeForEventHistory({
          ...routeParameters,
          queryParams: sharedFilterParams,
        })}
        active={pathMatches(
          page.url.pathname,
          routeForEventHistory({
            ...routeParameters,
          }),
        )}
      >
        <Badge type="primary" class="px-2 py-0">
          {workflow.historyEvents}
        </Badge>
      </Tab>
      <Tab
        label={translate('workflows.relationships')}
        id="relationships-tab"
        href={routeForRelationships(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForRelationships(routeParameters),
        )}
      >
        <Badge type="primary" class="px-2 py-0">
          {workflowRelationships.relationshipCount}
        </Badge></Tab
      >
      {#if linkCount > 0}
        <Tab
          label={translate('workflows.nexus-links-tab')}
          id="nexus-links-tab"
          href={routeForNexusLinks(routeParameters)}
          active={pathMatches(
            page.url.pathname,
            routeForNexusLinks(routeParameters),
          )}
        >
          <Badge type="primary" class="px-2 py-0">
            {linkCount}
          </Badge>
        </Tab>
      {/if}
      <Tab
        label={translate('workflows.workers-tab')}
        id="workers-tab"
        href={routeForWorkers(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkers(routeParameters),
        )}
      >
        <Badge type="primary" class="px-2 py-0">
          {getWorkflowPollersWithVersions(
            workflow.searchAttributes.indexedFields,
            workers,
          )?.pollers?.length || 0}
        </Badge>
      </Tab>
      <Tab
        label={translate('workflows.pending-activities-tab')}
        id="pending-activities-tab"
        href={routeForPendingActivities(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForPendingActivities(routeParameters),
        )}
      >
        <Badge
          type={activitiesCanceled ? 'warning' : 'primary'}
          class="px-2 py-0"
        >
          <div class="flex items-center gap-1">
            {#if activitiesCanceled}
              <Icon name="canceled" />
            {/if}
            {workflow?.pendingActivities?.length}
          </div>
        </Badge>
      </Tab>
      <Tab
        label={translate('workflows.call-stack-tab')}
        id="call-stack-tab"
        href={routeForCallStack(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForCallStack(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.queries-tab')}
        id="queries-tab"
        href={routeForWorkflowQuery(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowQuery(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.user-metadata-tab')}
        id="user-metadata-tab"
        href={routeForUserMetadata(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForUserMetadata(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.search-attributes-tab')}
        id="search-attributes-tab"
        href={routeForWorkflowSearchAttributes(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowSearchAttributes(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.memo-tab')}
        id="memo-tab"
        href={routeForWorkflowMemo(routeParameters)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowMemo(routeParameters),
        )}
      />
    </TabList>
  </Tabs>
</header>
