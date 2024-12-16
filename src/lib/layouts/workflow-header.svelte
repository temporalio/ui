<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import WorkflowDetails from '$lib/components/lines-and-dots/workflow-details.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import WorkflowVersioningHeader from '$lib/components/workflow-versioning-header.svelte';
  import AccordionLight from '$lib/holocene/accordion/accordion-light.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
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
    routeForPendingActivities,
    routeForRelationships,
    routeForWorkers,
    routeForWorkflowMetadata,
    routeForWorkflowQuery,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  $: ({ namespace, workflow: workflowId, run: runId, id } = $page.params);
  $: ({ workflow, workers } = $workflowRun);

  $: routeParameters = {
    namespace,
    workflow: workflowId,
    run: runId,
  };

  $: isRunning = $workflowRun?.workflow?.isRunning;
  $: activitiesCanceled = ['Terminated', 'TimedOut', 'Canceled'].includes(
    $workflowRun.workflow?.status,
  );
  $: cancelInProgress = isCancelInProgress(
    $workflowRun?.workflow?.status,
    $fullEventHistory,
  );
  $: workflowHasBeenReset = has($resetWorkflows, runId);
  $: workflowUsesVersioning =
    workflow?.assignedBuildId ??
    workflow?.mostRecentWorkerVersionStamp?.useVersioning;
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );

  $: summary = $workflowRun?.userMetadata?.summary;
  $: details = $workflowRun?.userMetadata?.details;
  $: hasUserMetadata = summary || details;
  $: currentDetails = $workflowRun?.metadata?.currentDetails;
</script>

<div class="flex items-center justify-between pb-4">
  <div class="flex items-center gap-2">
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
</div>
<header class="rounded-top flex flex-col gap-2">
  <div class="flex flex-col items-center justify-between gap-4 lg:flex-row">
    <div class="flex flex-col items-center gap-4 lg:flex-row">
      <WorkflowStatus status={workflow?.status} big />
      <div class="flex flex-col flex-wrap gap-0">
        <h1 data-testid="workflow-id-heading" class="gap-0 overflow-hidden">
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
          <WorkflowVersioningHeader {workflow} />
        {/if}
      </div>
    </div>
    <div class="px-2">
      <WorkflowActions {isRunning} {cancelInProgress} {workflow} {namespace} />
    </div>
  </div>
  {#if hasUserMetadata}
    <AccordionLight let:open>
      <div slot="title" class="flex w-full items-center gap-2 p-2 text-xl">
        <Icon
          name="info"
          class="text-brand"
          width={32}
          height={32}
        />{translate('workflows.summary-and-details')}
      </div>
      {#if open && summary}
        <h3>{translate('workflows.summary')}</h3>
        <Markdown content={summary} />
      {/if}
      {#if open && details}
        <h3>{translate('workflows.details')}</h3>
        <Markdown content={details} />
      {/if}
    </AccordionLight>
  {/if}
  {#if currentDetails}
    <AccordionLight let:open>
      <div
        slot="title"
        class="flex w-full items-center gap-2 rounded p-2 text-xl"
      >
        <Icon
          name="flag"
          class="text-brand"
          width={32}
          height={32}
        />{translate('workflows.current-details')}
      </div>
      {#if open}
        <Markdown content={currentDetails} />
      {/if}
    </AccordionLight>
  {/if}
  <WorkflowDetails />
  {#if cancelInProgress}
    <div in:fly={{ duration: 200, delay: 100 }}>
      <Alert
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
  <Tabs>
    <TabList class="flex flex-wrap gap-6 pt-2" label="workflow detail">
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
        <Badge type="primary" class="px-2 py-0">
          {workflow?.historyEvents}
        </Badge>
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
        <Badge type="primary" class="px-2 py-0">
          {workers?.pollers?.length}
        </Badge>
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
        <Badge type="primary" class="px-2 py-0"
          >{workflowRelationships.relationshipCount}</Badge
        >
      </Tab>
      <Tab
        label={translate('workflows.pending-activities-tab')}
        id="pending-activities-tab"
        href={routeForPendingActivities(routeParameters)}
        active={pathMatches(
          $page.url.pathname,
          routeForPendingActivities(routeParameters),
        )}
      >
        <Badge
          type={activitiesCanceled ? 'warning' : 'primary'}
          class="px-2 py-0"
        >
          <div class="flex items-center gap-1">
            {#if activitiesCanceled}<Icon name="canceled" />
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
</header>
