<script lang="ts">
  import CodecServerErrorBanner from '$lib/components/codec-server-error-banner.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { BadgeCount } from '$lib/io/badge-count';
  import IconChevronLeft from '$lib/io/icon/icons/chevron-left.svelte';
  import IconInfo from '$lib/io/icon/icons/info.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import {
    routeForCallStack,
    routeForEventHistory,
    routeForPendingActivities,
    routeForRelationships,
    routeForTimeline,
    routeForUserMetadata,
    routeForWorkflowMemo,
    routeForWorkflowQuery,
    routeForWorkflows,
    routeForWorkflowSearchAttributes,
    routeForWorkflowWorkers,
  } from '$lib/utilities/route-for';
  import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

  import { getHeaderPresentation } from './header-presentation';
  import type { ExecutionGraphSnapshot } from '../data/execution-graph/types';
  import type { QualifiedHistoryEvent } from '../data/history-events/types';
  import type { ExecutionIdentity } from '../data/identity-keys';

  import ExecutionSummary from './execution-summary.svelte';

  let {
    identity,
    details,
    events,
    graph,
  }: {
    identity: ExecutionIdentity;
    details: WorkflowExecution;
    events: readonly QualifiedHistoryEvent[];
    graph: ExecutionGraphSnapshot;
  } = $props();

  const presentation = $derived(
    getHeaderPresentation(identity, details, events, graph),
  );
  const routeParameters = $derived({
    namespace: identity.namespace,
    workflow: identity.workflowId,
    run: identity.runId,
  });
</script>

<div class="flex items-center justify-between">
  <Link
    href={routeForWorkflows({ namespace: identity.namespace })}
    data-testid="back-to-workflows"
    LeadingIcon={IconChevronLeft}
  >
    {translate('workflows.back-to-workflows')}
  </Link>
</div>
<header class="flex flex-col gap-4">
  <div class="flex flex-col items-start justify-between gap-4 xl:flex-row">
    <div
      class="flex w-full flex-col items-start gap-4 xl:flex-row xl:items-center"
    >
      <WorkflowStatusBadge
        role="status"
        aria-atomic="true"
        status={details.status}
        delayed={isWorkflowDelayed(details)}
        taskFailure={isWorkflowTaskFailure(details)}
      />
      <h1
        data-testid="workflow-id-heading"
        class="gap-0 overflow-hidden max-sm:text-xl sm:max-md:text-2xl"
      >
        <Copyable
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          content={identity.workflowId}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis text-left"
        />
      </h1>
    </div>
  </div>
  <CodecServerErrorBanner />
  <ExecutionSummary
    {identity}
    {details}
    historyEvents={events}
    latestRunId={presentation.latestRunId}
  />
  {#if presentation.cancelInProgress}
    <Alert
      Icon={IconInfo}
      intent="info"
      title={translate('workflows.cancel-request-sent')}
      class="max-w-screen-lg xl:w-2/3"
    >
      {translate('workflows.cancel-request-sent-description')}
    </Alert>
  {/if}
  {#if details.isPaused}
    <Alert
      Icon={IconInfo}
      intent="info"
      title={translate('workflows.workflow-paused')}
      class="max-w-screen-lg xl:w-2/3"
      data-testid="workflow-paused-alert"
    >
      <p>{translate('workflows.workflow-paused-description')}</p>
      <ul class="mt-2 list-disc pl-6">
        <li>{translate('workflows.workflow-pause-description-item-1')}</li>
        <li>{translate('workflows.workflow-pause-description-item-2')}</li>
        <li>{translate('workflows.workflow-pause-description-item-3')}</li>
      </ul>
    </Alert>
  {/if}
  <Tabs>
    <TabList label="workflow detail">
      <Tab
        label={translate('workflows.timeline-tab')}
        id="timeline-tab"
        href={routeForTimeline({
          ...routeParameters,
          queryParams: { new_timeline: 'true' },
        })}
        active
      />
      <Tab
        label={translate('workflows.history-tab')}
        id="history-tab"
        href={routeForEventHistory(routeParameters)}
        active={false}
      >
        <BadgeCount value={details.historyEvents || events.length} />
      </Tab>
      <Tab
        label={translate('workflows.relationships')}
        id="relationships-tab"
        href={routeForRelationships(routeParameters)}
        active={false}
      >
        <BadgeCount value={presentation.relationshipCount} />
      </Tab>
      <Tab
        label={translate('workflows.workers-tab')}
        id="workers-tab"
        href={routeForWorkflowWorkers(routeParameters)}
        active={false}
      />
      <Tab
        label={translate('workflows.pending-activities-tab')}
        id="pending-activities-tab"
        href={routeForPendingActivities(routeParameters)}
        active={false}
      >
        <BadgeCount value={details.pendingActivities.length} />
      </Tab>
      <Tab
        label={translate('workflows.call-stack-tab')}
        id="call-stack-tab"
        href={routeForCallStack(routeParameters)}
        active={false}
      />
      <Tab
        label={translate('workflows.queries-tab')}
        id="queries-tab"
        href={routeForWorkflowQuery(routeParameters)}
        active={false}
      />
      <Tab
        label={translate('workflows.user-metadata-tab')}
        id="user-metadata-tab"
        href={routeForUserMetadata(routeParameters)}
        active={false}
      />
      <Tab
        label={translate('workflows.search-attributes-tab')}
        id="search-attributes-tab"
        href={routeForWorkflowSearchAttributes(routeParameters)}
        active={false}
      />
      <Tab
        label={translate('workflows.memo-tab')}
        id="memo-tab"
        href={routeForWorkflowMemo(routeParameters)}
        active={false}
      />
    </TabList>
  </Tabs>
</header>
