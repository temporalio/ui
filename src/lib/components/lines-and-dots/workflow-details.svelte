<script lang="ts">
  import { page } from '$app/stores';

  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
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
  } from '../detail-list';
  import DetailListValue from '../detail-list/detail-list-value.svelte';

  import SdkLogo from './sdk-logo.svelte';

  export let workflow: WorkflowExecution;
  export let next: string | undefined = undefined;
  let latestRunId: string | undefined = undefined;

  $: ({ namespace } = $page.params);

  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
  $: deployment =
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'];
  $: deploymentVersion =
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkerDeploymentVersion'
    ];
  $: versioningBehavior =
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkflowVersioningBehavior'
    ];

  $: {
    if (next && !latestRunId) {
      fetchLatestRun();
    }
  }

  const fetchLatestRun = async () => {
    const result = await fetchWorkflow({
      namespace,
      workflowId: workflow.id,
    });
    latestRunId = result?.workflow?.runId;
  };
</script>

<DetailList aria-label="workflow details" rowCount={3}>
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
        namespace: $page.params.namespace,
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

      {#if deploymentVersion}
        <DetailListLabel>
          {translate('deployments.deployment-version')}
        </DetailListLabel>
        <DetailListTextValue
          text={workflow.searchAttributes.indexedFields[
            'TemporalWorkerDeploymentVersion'
          ]}
        />
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
    <DetailListLabel>SDK</DetailListLabel>
    <DetailListValue>
      <SdkLogo />
    </DetailListValue>
  </DetailListColumn>

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

    <DetailListLabel>{translate('commmon.history-size-bytes')}</DetailListLabel>
    <DetailListTextValue text={workflow?.historySizeBytes} />

    {#if !$isCloud}
      <DetailListLabel
        >{translate('workflows.state-transition')}</DetailListLabel
      >
      <DetailListTextValue text={workflow?.stateTransitionCount} />
    {/if}
  </DetailListColumn>
</DetailList>
