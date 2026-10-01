<script lang="ts">
  import { fly } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import { DetailListTimestampValue } from '$lib/components/detail-list';
  import DetailListLabel from '$lib/components/detail-list/detail-list-label.svelte';
  import DetailListValue from '$lib/components/detail-list/detail-list-value.svelte';
  import DetailList from '$lib/components/detail-list/detail-list.svelte';
  import ExtensionSlot from '$lib/components/extensions/extension-slot.svelte';
  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import NoWorkersPollingAlert from '$lib/components/workers/no-workers-polling-alert.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import {
    WORKFLOW_RUN_CTX,
    type WorkflowRunContext,
  } from '$lib/contexts/workflow-run-context';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { BadgeCount } from '$lib/io/badge-count';
  import { IconCanceled, IconChevronLeft, IconInfo } from '$lib/io/icon';
  import { getVisibleInboundNexusLinkEvents } from '$lib/runes/inbound-nexus-links.svelte';
  import { workflowViewPreference } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getSharedFilterParams } from '$lib/utilities/event-filter-params';
  import { getWorkerDeploymentName } from '$lib/utilities/get-worker-deployment-name';
  import {
    getWorkflowNexusLinksFromHistory,
    getWorkflowRelationships,
  } from '$lib/utilities/get-workflow-relationships';
  import { isRunningWithNoWorkers } from '$lib/utilities/is-running-with-no-workers';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForCallStack,
    routeForEventHistory,
    routeForNexusLinks,
    routeForPendingActivities,
    routeForRelationships,
    routeForTimeline,
    routeForUserMetadata,
    routeForWorkflow,
    routeForWorkflowMemo,
    routeForWorkflowQuery,
    routeForWorkflows,
    routeForWorkflowSearchAttributes,
    routeForWorkflowWorkers,
  } from '$lib/utilities/route-for';
  import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

  const {
    namespace,
    workflow: workflowId,
    run: runId,
    id: eventId,
  } = $derived(page.params);

  let { headerSnippet }: { headerSnippet?: Snippet } = $props();
  const workflowRunCtx = getContext<WorkflowRunContext>(WORKFLOW_RUN_CTX);
  const { copy: copyPinnedRunUrl } = copyToClipboard();

  const { workflow, workers, workerCount } = $derived($workflowRun);
  const runningWithNoWorkers = $derived(isRunningWithNoWorkers($workflowRun));
  const workerDeployment = $derived(getWorkerDeploymentName(workers, workflow));
  const routeParameters = $derived({
    namespace,
    workflow: workflowId,
    run: runId,
  });
  const sharedFilterParams = $derived(getSharedFilterParams(page.url));
  const routeParametersWithQuery = $derived({
    ...routeParameters,
    queryParams: sharedFilterParams,
  });

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
  const visibleInboundLinks = getVisibleInboundNexusLinkEvents(
    () => $fullEventHistory,
  );
  const inboundLinks = $derived(visibleInboundLinks.events?.length || 0);
  const linkCount = $derived(outboundLinks + inboundLinks);
  const taskQueue = $derived(workflow?.taskQueue ?? '');
</script>

<div class="flex items-center justify-between">
  <div class="flex items-center gap-2">
    <Link
      href={workflowsHref}
      data-testid="back-to-workflows"
      LeadingIcon={IconChevronLeft}
    >
      {eventId
        ? translate('common.workflows')
        : translate('workflows.back-to-workflows')}
    </Link>
    {#if eventId}
      <Link
        href={routeForWorkflow({
          ...routeParameters,
        })}
        data-testid="back-to-workflow-execution"
        LeadingIcon={IconChevronLeft}
      >
        {runId}
      </Link>
    {/if}
  </div>
</div>
<header class="flex flex-col gap-4">
  <div class="flex flex-col items-start justify-between gap-4 xl:flex-row">
    <div
      class="flex w-full flex-col items-start gap-4 xl:flex-row xl:items-center"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-4 max-xl:w-full"
      >
        {#if workflow}
          <WorkflowStatusBadge
            role="status"
            aria-atomic="true"
            status={workflow.status}
            delayed={isWorkflowDelayed(workflow)}
            taskFailure={isWorkflowTaskFailure(workflow)}
          />
        {/if}
        <div class="xl:hidden">
          <WorkflowActions
            {cancelInProgress}
            workflow={workflow!}
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
        {cancelInProgress}
        workflow={workflow!}
        {namespace}
        first={workflowRelationships.first}
        next={workflowRelationships.next}
      />
    </div>
  </div>
  <div class="flex flex-wrap items-center gap-4">
    <ToggleSwitch
      id="follow-chained-runs"
      label={translate('workflows.follow-chained-runs')}
      checked={workflowRunCtx.following}
      disabled={!workflow?.isRunning &&
        !workflow?.isPaused &&
        !workflowRunCtx.following}
      onchange={() =>
        workflowRunCtx.following
          ? workflowRunCtx.disableFollowing()
          : workflowRunCtx.enableFollowing()}
      data-testid="follow-chained-runs"
    />
    {#if workflowRunCtx.following}
      <Button
        variant="secondary"
        size="xs"
        onclick={(event) =>
          copyPinnedRunUrl(
            event,
            new URL(workflowRunCtx.pinnedRunUrl(), page.url).href,
          )}
      >
        {translate('workflows.copy-pinned-run-link')}
      </Button>
    {/if}
    <span class="sr-only" aria-live="polite">
      {workflowRunCtx.staging
        ? translate('workflows.waiting-for-next-run')
        : ''}
    </span>
  </div>
  <CodecServerErrorBanner />
  <WorkflowDetails workflow={workflow!} next={workflowRelationships.next} />
  <ExtensionSlot
    name="workflow.header.after-details"
    class="flex w-full flex-col gap-2"
    context={{
      workflow: {
        workflowId,
        runId,
        status: workflow?.status ?? undefined,
        taskQueue: workflow?.taskQueue,
        workflowType: workflow?.name,
      },
    }}
  />
  {#if cancelInProgress}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        Icon={IconInfo}
        intent="info"
        title={translate('workflows.cancel-request-sent')}
        class="max-w-screen-lg xl:w-2/3"
      >
        {translate('workflows.cancel-request-sent-description')}
      </Alert>
    </div>
  {/if}
  {#if isPaused}
    {@const pauseInfo = workflow?.workflowExtendedInfo.pauseInfo}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        Icon={IconInfo}
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
          {#if pauseInfo}
            <DetailList aria-label="pause details" rowCount={3}>
              {#if pauseInfo.identity}
                <DetailListLabel>{translate('common.identity')}</DetailListLabel
                >
                <DetailListValue
                  >{pauseInfo.identity ?? 'test@temporal.io'}</DetailListValue
                >
              {/if}
              <DetailListLabel
                >{translate('workflows.paused-time')}</DetailListLabel
              >
              <DetailListTimestampValue timestamp={pauseInfo.pausedTime} />
              {#if pauseInfo.reason}
                <DetailListLabel>{translate('common.reason')}</DetailListLabel>
                <DetailListValue>{pauseInfo.reason}</DetailListValue>
              {/if}
            </DetailList>
          {/if}
        </div>
      </Alert>
    </div>
  {/if}
  {#if workflowHasBeenReset}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        Icon={IconInfo}
        intent="info"
        data-testid="workflow-reset-alert"
        title={translate('workflows.reset-success-alert-title')}
        class="max-w-screen-lg xl:w-2/3"
      >
        You can find the resulting Workflow Execution <Link
          href={routeForWorkflow({
            namespace,
            workflow: workflowId,
            run: resetRunId!,
          })}>here</Link
        >.
      </Alert>
    </div>
  {/if}
  {#if headerSnippet}
    {@render headerSnippet()}
  {/if}
  <NoWorkersPollingAlert
    {namespace}
    {taskQueue}
    {runningWithNoWorkers}
    deployment={workerDeployment}
  />
  <Tabs>
    <TabList label="workflow detail">
      <Tab
        label={translate('workflows.timeline-tab')}
        id="timeline-tab"
        href={routeForTimeline({
          ...routeParametersWithQuery,
        })}
        active={pathMatches(
          page.url.pathname,
          routeForTimeline(routeParameters),
        )}
        onClick={() => ($workflowViewPreference = 'timeline')}
      />
      <Tab
        label={translate('workflows.history-tab')}
        id="history-tab"
        href={routeForEventHistory({
          ...routeParametersWithQuery,
        })}
        onClick={() => ($workflowViewPreference = 'history')}
        active={pathMatches(
          page.url.pathname,
          routeForEventHistory({
            ...routeParameters,
          }),
        )}
      >
        <BadgeCount value={workflow?.historyEvents ?? 0} />
      </Tab>
      <Tab
        label={translate('workflows.relationships')}
        id="relationships-tab"
        href={routeForRelationships(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForRelationships(routeParameters),
        )}
      >
        <BadgeCount value={workflowRelationships.relationshipCount} />
      </Tab>
      {#if linkCount > 0}
        <Tab
          label={translate('workflows.nexus-links-tab')}
          id="nexus-links-tab"
          href={routeForNexusLinks(routeParametersWithQuery)}
          active={pathMatches(
            page.url.pathname,
            routeForNexusLinks(routeParameters),
          )}
        >
          <BadgeCount value={linkCount} />
        </Tab>
      {/if}
      <Tab
        label={translate('workflows.workers-tab')}
        id="workers-tab"
        href={routeForWorkflowWorkers(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowWorkers(routeParameters),
        )}
      >
        {#if workerCount !== undefined}
          <BadgeCount value={workerCount} />
        {/if}
      </Tab>
      <Tab
        label={translate('workflows.pending-activities-tab')}
        id="pending-activities-tab"
        href={routeForPendingActivities(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForPendingActivities(routeParameters),
        )}
      >
        {#if activitiesCanceled}
          <Badge
            colorScheme="warning"
            Icon={IconCanceled}
            text={String(workflow?.pendingActivities?.length ?? 0)}
          />
        {:else}
          <BadgeCount value={workflow?.pendingActivities?.length ?? 0} />
        {/if}
      </Tab>
      <Tab
        label={translate('workflows.call-stack-tab')}
        id="call-stack-tab"
        href={routeForCallStack(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForCallStack(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.queries-tab')}
        id="queries-tab"
        href={routeForWorkflowQuery(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowQuery(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.user-metadata-tab')}
        id="user-metadata-tab"
        href={routeForUserMetadata(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForUserMetadata(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.search-attributes-tab')}
        id="search-attributes-tab"
        href={routeForWorkflowSearchAttributes(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowSearchAttributes(routeParameters),
        )}
      />
      <Tab
        label={translate('workflows.memo-tab')}
        id="memo-tab"
        href={routeForWorkflowMemo(routeParametersWithQuery)}
        active={pathMatches(
          page.url.pathname,
          routeForWorkflowMemo(routeParameters),
        )}
      />
    </TabList>
  </Tabs>
</header>
