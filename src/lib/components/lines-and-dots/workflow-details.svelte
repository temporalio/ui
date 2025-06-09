<script lang="ts">
  import { page } from '$app/state';

  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForWorkerDeployment,
    routeForWorkers,
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
    text={formatDate(workflow?.startTime, $timeFormat, {
      relative: $relativeTime,
    })}
    tooltipText={$relativeTime
      ? formatDate(workflow?.startTime, $timeFormat, { relative: false })
      : formatDate(workflow?.startTime, $timeFormat, { relative: true })}
  />

  <DetailListLabel>{translate('common.end')}</DetailListLabel>
  <DetailListTextValue
    text={workflow?.endTime
      ? formatDate(workflow?.endTime, $timeFormat, {
          relative: $relativeTime,
        })
      : '-'}
    tooltipText={$relativeTime
      ? formatDate(workflow?.endTime, $timeFormat, { relative: false })
      : formatDate(workflow?.endTime, $timeFormat, { relative: true })}
  />

  <DetailListLabel>
    {translate('common.duration')}
  </DetailListLabel>
  <DetailListTextValue text={elapsedTime} />

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
      href={routeForWorkers({
        namespace,
        workflow: workflow?.id,
        run: workflow?.runId,
      })}
    />
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
    {#if workflow?.parent}
      <DetailListLabel>{translate('workflows.parent-workflow')}</DetailListLabel
      >
      <DetailListLinkValue
        text={workflow?.parent?.workflowId}
        href={routeForWorkflow({
          namespace,
          workflow: workflow?.parent?.workflowId,
          run: workflow?.parent?.runId,
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

    <DetailListLabel>{translate('common.history-size-bytes')}</DetailListLabel>
    <DetailListTextValue text={workflow?.historySizeBytes} />

    {#if !$isCloud}
      <DetailListLabel
        >{translate('workflows.state-transitions')}</DetailListLabel
      >
      <DetailListTextValue text={workflow?.stateTransitionCount} />
    {/if}

    <DetailListLabel>SDK</DetailListLabel>
    <DetailListValue>
      <SdkLogo />
    </DetailListValue>
  </DetailListColumn>
</DetailList>
