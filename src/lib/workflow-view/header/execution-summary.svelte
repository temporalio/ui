<script lang="ts">
  import DetailListColumn from '$lib/components/detail-list/detail-list-column.svelte';
  import DetailListLabel from '$lib/components/detail-list/detail-list-label.svelte';
  import DetailListLinkValue from '$lib/components/detail-list/detail-list-link-value.svelte';
  import DetailListTextValue from '$lib/components/detail-list/detail-list-text-value.svelte';
  import DetailListTimestampValue from '$lib/components/detail-list/detail-list-timestamp-value.svelte';
  import DetailListValue from '$lib/components/detail-list/detail-list-value.svelte';
  import DetailList from '$lib/components/detail-list/detail-list.svelte';
  import SdkLogo from '$lib/components/lines-and-dots/sdk-logo.svelte';
  import { translate } from '$lib/i18n/translate';
  import IconFilter from '$lib/io/icon/icons/filter.svelte';
  import IconInfo from '$lib/io/icon/icons/info.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import {
    formatDistanceAbbreviated,
    formatDuration,
  } from '$lib/utilities/format-time';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForSchedule,
    routeForWorkerDeployment,
    routeForWorkflow,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import { getExecutionSummarySdk } from './execution-summary-sdk';
  import type { QualifiedHistoryEvent } from '../data/history-events/types';
  import type { ExecutionIdentity } from '../data/identity-keys';

  interface Props {
    identity: ExecutionIdentity;
    details: WorkflowExecution;
    historyEvents: readonly QualifiedHistoryEvent[];
    latestRunId?: string;
  }

  let { identity, details, historyEvents, latestRunId }: Props = $props();

  const parent = $derived(details.parent);
  const scheduleId = $derived(
    details.searchAttributes?.indexedFields?.['TemporalScheduledById'],
  );
  const namespace = $derived(identity.namespace);
  const elapsedTime = $derived(
    formatDistanceAbbreviated({
      start: details.startTime,
      end: details.endTime || Date.now(),
      includeMilliseconds: true,
    }),
  );
  const deployment = $derived(
    details.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'],
  );
  const deploymentVersion = $derived(
    details.searchAttributes?.indexedFields?.[
      'TemporalWorkerDeploymentVersion'
    ],
  );
  const versioningBuildId = $derived(
    details.searchAttributes?.indexedFields?.['TemporalWorkerBuildId'] ||
      getBuildIdFromVersion(deploymentVersion),
  );
  const versioningBehavior = $derived(
    details.searchAttributes?.indexedFields?.[
      'TemporalWorkflowVersioningBehavior'
    ],
  );
  const historySizeFormatted = $derived(
    details.historySizeBytes
      ? formatBytes(parseInt(details.historySizeBytes, 10))
      : '',
  );
  const { sdk, version: sdkVersion } = $derived(
    getExecutionSummarySdk(historyEvents),
  );
</script>

<DetailList aria-label="workflow details" rowCount={5}>
  <DetailListLabel>{translate('common.start')}</DetailListLabel>
  <DetailListTimestampValue timestamp={details.startTime} />

  {#if details.startDelay}
    <DetailListLabel>{translate('workflows.execution-start')}</DetailListLabel>
    <DetailListTimestampValue timestamp={details.executionTime} />
  {/if}

  <DetailListLabel>{translate('common.end')}</DetailListLabel>
  <DetailListTimestampValue timestamp={details.endTime} fallback="-" />

  <DetailListLabel>{translate('common.duration')}</DetailListLabel>
  <DetailListTextValue text={elapsedTime} />

  {#if details.workflowExecutionTimeout && details.workflowExecutionTimeout.toString() !== '0s'}
    <DetailListLabel>{translate('workflows.workflow-timeout')}</DetailListLabel>
    <DetailListTextValue
      text={formatDuration(details.workflowExecutionTimeout)}
      tooltipText={formatDuration(details.workflowExecutionTimeout)}
    />
  {/if}

  <DetailListColumn>
    <DetailListLabel>{translate('common.run-id')}</DetailListLabel>
    <DetailListTextValue
      copyable
      copyableText={identity.runId}
      text={identity.runId}
    />

    <DetailListLabel>{translate('common.workflow-type')}</DetailListLabel>
    <DetailListLinkValue
      copyable
      copyableText={details.name}
      text={details.name}
      href={routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowType="${details.name}"`,
      }) ?? ''}
      Icon={IconFilter}
    />

    {#if details.taskQueue}
      <DetailListLabel>{translate('common.task-queue')}</DetailListLabel>
      <DetailListLinkValue
        copyable
        copyableText={details.taskQueue}
        text={details.taskQueue}
        href={routeForWorkflowsWithQuery({
          namespace,
          query: `TaskQueue="${details.taskQueue}"`,
        }) ?? ''}
        Icon={IconFilter}
      />
    {/if}

    {#if details.priority}
      {@const { priorityKey, fairnessKey } = details.priority}
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
        copyable
        copyableText={deployment}
        text={deployment}
        href={routeForWorkerDeployment({ namespace, deployment })}
      />

      {#if versioningBuildId}
        <DetailListLabel>{translate('deployments.build-id')}</DetailListLabel>
        <DetailListLinkValue
          copyable
          copyableText={versioningBuildId}
          text={versioningBuildId}
          href={deploymentVersion
            ? (routeForWorkflowsWithQuery({
                namespace,
                query: `TemporalWorkerDeploymentVersion="${deploymentVersion}"`,
              }) ?? '')
            : ''}
          Icon={deploymentVersion ? IconFilter : undefined}
        />
      {/if}

      {#if versioningBehavior}
        <DetailListLabel>
          {translate('deployments.versioning-behavior')}
        </DetailListLabel>
        <DetailListLinkValue
          copyable
          copyableText={versioningBehavior}
          text={versioningBehavior}
          href={routeForWorkflowsWithQuery({
            namespace,
            query: `TemporalWorkflowVersioningBehavior="${versioningBehavior}"`,
          }) ?? ''}
          Icon={IconFilter}
        />
      {/if}
    </DetailListColumn>
  {/if}

  <DetailListColumn>
    {#if scheduleId}
      <DetailListLabel>{translate('workflows.scheduled-by')}</DetailListLabel>
      <DetailListLinkValue
        text={scheduleId}
        href={routeForSchedule({ namespace, scheduleId })}
      />
    {/if}
    {#if parent?.workflowId && parent.runId}
      <DetailListLabel>{translate('workflows.parent-workflow')}</DetailListLabel
      >
      <DetailListLinkValue
        text={parent.workflowId}
        href={routeForWorkflow({
          namespace,
          workflow: parent.workflowId,
          run: parent.runId,
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
          workflow: identity.workflowId,
          run: latestRunId,
        })}
      />
    {/if}
  </DetailListColumn>

  <DetailListColumn>
    <DetailListLabel>{translate('common.history-size')}</DetailListLabel>
    <DetailListTextValue
      tooltipText={details.externalPayloadCount
        ? translate('workflows.external-payload-tooltip')
        : ''}
      Icon={details.externalPayloadCount ? IconInfo : undefined}
      iconPosition="trailing"
      text={historySizeFormatted}
    />
    {#if details.externalPayloadCount}
      <DetailListLabel>
        {translate('workflows.external-payload-size')}
      </DetailListLabel>
      <DetailListTextValue
        text={formatBytes(parseInt(details.externalPayloadSizeBytes ?? '', 10))}
      />
      <DetailListLabel>
        {translate('workflows.external-payload-count')}
      </DetailListLabel>
      <DetailListTextValue text={details.externalPayloadCount} />
    {/if}

    <DetailListLabel>{translate('workflows.state-transitions')}</DetailListLabel
    >
    <DetailListTextValue text={details.stateTransitionCount} />

    {#if sdk && sdkVersion}
      <DetailListLabel>{translate('workflows.sdk')}</DetailListLabel>
      <DetailListValue>
        <SdkLogo {sdk} version={sdkVersion} />
      </DetailListValue>
    {/if}
  </DetailListColumn>
</DetailList>
