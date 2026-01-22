<script lang="ts">
  import { page } from '$app/state';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timestamp } from '$lib/runes/timestamp.svelte';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { fullEventHistory } from '$lib/stores/events';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    formatDistanceAbbreviated,
    formatDuration,
  } from '$lib/utilities/format-time';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import { getSDKandVersion } from '$lib/utilities/get-sdk-version';
  import { isWorkflowTaskCompletedEvent } from '$lib/utilities/is-event-type';
  import {
    routeForSchedule,
    routeForTaskQueue,
    routeForWorkerDeployment,
    routeForWorkflow,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import {
    DetailList,
    DetailListColumn,
    DetailListLabel,
    DetailListLinkValue,
    DetailListTextValue,
    DetailListValue,
  } from '../detail-list';

  import SdkLogo from './sdk-logo.svelte';

  interface Props {
    workflow: WorkflowExecution;
    next?: string;
  }

  let { workflow, next }: Props = $props();

  let latestRunId = $state<string | undefined>(undefined);

  const parent = $derived(workflow?.parent);
  const scheduleId = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalScheduledById'],
  );
  const { namespace } = $derived(page.params);
  const elapsedTime = $derived(
    formatDistanceAbbreviated({
      start: workflow?.startTime,
      end: workflow?.endTime || Date.now(),
      includeMilliseconds: true,
    }),
  );
  const deployment = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'],
  );
  const deploymentVersion = $derived(
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkerDeploymentVersion'
    ],
  );

  const versioningBuildId = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerBuildId'] ||
      getBuildIdFromVersion(deploymentVersion),
  );

  const versioningBehavior = $derived(
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkflowVersioningBehavior'
    ],
  );
  let totalActions = $derived(
    $fullEventHistory.reduce((acc, e) => e.billableActions + acc, 0).toString(),
  );

  const workflowCompletedTasks = $derived(
    $fullEventHistory.filter(isWorkflowTaskCompletedEvent),
  );

  const { sdk, version: sdkVersion } = $derived(
    getSDKandVersion(workflowCompletedTasks),
  );

  const fetchLatestRun = async () => {
    const result = await fetchWorkflow({
      namespace,
      workflowId: workflow.id,
    });
    latestRunId = result?.workflow?.runId;
  };

  $effect(() => {
    if (next && !latestRunId) {
      fetchLatestRun();
    }
  });
</script>

<DetailList aria-label="workflow details" rowCount={5}>
  <DetailListLabel>{translate('common.start')}</DetailListLabel>
  <DetailListTextValue
    text={$timestamp(workflow?.startTime)}
    tooltipText={formatDate(workflow?.startTime, $timeFormat, {
      relative: !$relativeTime,
      format: $timestampFormat,
    })}
  />

  {#if workflow?.startDelay}
    <DetailListLabel>{translate('workflows.execution-start')}</DetailListLabel>
    <DetailListTextValue
      text={$timestamp(workflow?.executionTime)}
      tooltipText={formatDate(workflow?.executionTime, $timeFormat, {
        relative: !$relativeTime,
        format: $timestampFormat,
      })}
    />
  {/if}

  <DetailListLabel>{translate('common.end')}</DetailListLabel>
  <DetailListTextValue
    text={workflow?.endTime ? $timestamp(workflow?.endTime) : '-'}
    tooltipText={formatDate(workflow?.endTime, $timeFormat, {
      relative: !$relativeTime,
      format: $timestampFormat,
    })}
  />

  <DetailListLabel>
    {translate('common.duration')}
  </DetailListLabel>
  <DetailListTextValue text={elapsedTime} />

  {#if workflow?.workflowExecutionTimeout && workflow?.workflowExecutionTimeout.toString() !== '0s'}
    <DetailListLabel>{translate('workflows.workflow-timeout')}</DetailListLabel>
    <DetailListTextValue
      text={formatDuration(workflow.workflowExecutionTimeout)}
      tooltipText={formatDuration(workflow.workflowExecutionTimeout)}
    />
  {/if}

  <DetailListColumn>
    <DetailListLabel>{translate('common.run-id')}</DetailListLabel>
    <DetailListTextValue
      copyable
      copyableText={workflow?.runId}
      text={workflow?.runId}
    />

    <DetailListLabel>{translate('common.workflow-type')}</DetailListLabel>
    <DetailListLinkValue
      copyable
      copyableText={workflow?.name}
      text={workflow?.name}
      href={routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowType="${workflow?.name}"`,
      })}
      iconName="filter"
    />

    <DetailListLabel>{translate('common.task-queue')}</DetailListLabel>
    <DetailListLinkValue
      text={workflow?.taskQueue}
      href={routeForTaskQueue({
        namespace,
        queue: workflow?.taskQueue,
      })}
    />

    {#if workflow?.priority}
      {@const { priorityKey, fairnessKey } = workflow.priority}
      {#if priorityKey}
        <DetailListLabel>{translate('workflows.priority')}</DetailListLabel>
        <DetailListTextValue text={String(priorityKey)} />
      {/if}
      {#if fairnessKey}
        <DetailListLabel>{translate('workflows.fairness')}</DetailListLabel>
        <DetailListTextValue text={fairnessKey} />
      {/if}
    {/if}
  </DetailListColumn>

  {#if deployment}
    <DetailListColumn>
      <DetailListLabel>{translate('deployments.deployment')}</DetailListLabel>
      <DetailListLinkValue
        text={deployment}
        href={routeForWorkerDeployment({
          namespace,
          deployment,
        })}
      />

      {#if versioningBuildId}
        <DetailListLabel>
          {translate('deployments.build-id')}
        </DetailListLabel>
        <DetailListTextValue text={versioningBuildId} />
      {/if}

      {#if versioningBehavior}
        <DetailListLabel>
          {translate('deployments.versioning-behavior')}
        </DetailListLabel>
        <DetailListTextValue text={versioningBehavior} />
      {/if}
    </DetailListColumn>
  {/if}

  <DetailListColumn>
    {#if scheduleId}
      <DetailListLabel>{translate('workflows.scheduled-by')}</DetailListLabel>
      <DetailListLinkValue
        text={scheduleId}
        href={routeForSchedule({
          namespace,
          scheduleId,
        })}
      />
    {/if}
    {#if parent}
      <DetailListLabel>{translate('workflows.parent-workflow')}</DetailListLabel
      >
      <DetailListLinkValue
        text={parent?.workflowId}
        href={routeForWorkflow({
          namespace,
          workflow: parent?.workflowId,
          run: parent?.runId,
        })}
      />
    {/if}
    {#if latestRunId}
      <DetailListLabel
        >{translate('workflows.latest-execution')}</DetailListLabel
      >
      <DetailListLinkValue
        text={latestRunId}
        href={routeForWorkflow({
          namespace,
          workflow: workflow?.id,
          run: latestRunId,
        })}
      />
    {/if}
  </DetailListColumn>

  <DetailListColumn>
    <DetailListLabel>{translate('common.history-size-bytes')}</DetailListLabel>
    <DetailListTextValue text={workflow?.historySizeBytes} />

    {#if !$isCloud}
      <DetailListLabel
        >{translate('workflows.state-transitions')}</DetailListLabel
      >
      <DetailListTextValue text={workflow?.stateTransitionCount} />
    {:else}
      <Tooltip
        bottomLeft
        text={translate('workflows.billable-actions-disclaimer')}
        width={240}
        class="col-[1]"
      >
        <DetailListLabel
          href="https://docs.temporal.io/cloud/actions#actions-in-workflows"
        >
          {translate('workflows.billable-actions')}
        </DetailListLabel>
      </Tooltip>
      <DetailListTextValue text={totalActions} />
    {/if}

    {#if sdk && sdkVersion}
      <DetailListLabel>SDK</DetailListLabel>
      <DetailListValue>
        <SdkLogo {sdk} version={sdkVersion} />
      </DetailListValue>
    {/if}
  </DetailListColumn>
</DetailList>
