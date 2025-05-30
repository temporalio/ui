<script lang="ts">
  import { page } from '$app/stores';

  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { fullEventHistory } from '$lib/stores/events';
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

  import SdkLogo from './sdk-logo.svelte';
  import WorkflowDetail from './workflow-detail.svelte';

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
  $: totalActions = $fullEventHistory
    .reduce((acc, e) => e.billableActions + acc, 0)
    .toString();

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

<div
  class="flex w-full flex-col gap-2 {deployment
    ? '2xl:flex-row 2xl:gap-8'
    : 'xl:flex-row xl:gap-8'}"
>
  <div
    class="flex w-full flex-col gap-2 {deployment ? '2xl:w-1/4' : 'xl:w-1/3'}"
  >
    <WorkflowDetail
      content={`💰${totalActions}`}
      title="Billable Actions"
      badge="success"
    />
    <WorkflowDetail
      title={translate('common.start')}
      tooltip={$relativeTime
        ? formatDate(workflow?.startTime, $timeFormat, {
            relative: false,
          })
        : formatDate(workflow?.startTime, $timeFormat, {
            relative: true,
          })}
      content={formatDate(workflow?.startTime, $timeFormat, {
        relative: $relativeTime,
      })}
    />
    <WorkflowDetail
      title={translate('common.end')}
      tooltip={$relativeTime
        ? formatDate(workflow?.endTime, $timeFormat, {
            relative: false,
          })
        : formatDate(workflow?.endTime, $timeFormat, {
            relative: true,
          })}
      content={workflow?.endTime
        ? formatDate(workflow?.endTime, $timeFormat, {
            relative: $relativeTime,
          })
        : '-'}
    />
    <WorkflowDetail content={elapsedTime} icon="clock" />
  </div>
  <div
    class="flex w-full flex-col gap-2 {deployment ? '2xl:w-1/4' : 'xl:w-1/3'}"
  >
    <WorkflowDetail
      title={translate('common.run-id')}
      content={workflow?.runId}
      copyable
    />
    <WorkflowDetail
      title={translate('common.workflow-type')}
      content={workflow?.name}
      copyable
      filterable
      href={routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowType="${workflow?.name}"`,
      })}
    />
    <WorkflowDetail
      title={translate('common.task-queue')}
      content={workflow?.taskQueue}
      href={routeForWorkers({
        namespace: $page.params.namespace,
        workflow: workflow?.id,
        run: workflow?.runId,
      })}
    />
  </div>
  {#if deployment}
    <div class="flex w-full flex-col gap-2 2xl:w-1/4">
      <WorkflowDetail
        title={translate('deployments.deployment')}
        content={deployment}
        href={routeForWorkerDeployment({
          namespace,
          deployment,
        })}
      />
      {#if deploymentVersion}
        <WorkflowDetail
          title={translate('deployments.deployment-version')}
          content={workflow.searchAttributes.indexedFields[
            'TemporalWorkerDeploymentVersion'
          ]}
        />
      {/if}
      {#if versioningBehavior}
        <WorkflowDetail
          title={translate('deployments.versioning-behavior')}
          content={versioningBehavior}
        />
      {/if}
    </div>
  {/if}
  <div
    class="flex w-full flex-col gap-2 {deployment ? '2xl:w-1/4' : 'xl:w-1/3'}"
  >
    <SdkLogo />
    {#if workflow?.parent}
      <WorkflowDetail
        title={translate('workflows.parent-workflow')}
        content={workflow?.parent?.workflowId}
        href={routeForWorkflow({
          namespace,
          workflow: workflow?.parent?.workflowId,
          run: workflow?.parent?.runId,
        })}
      />
    {/if}
    {#if latestRunId}
      <WorkflowDetail
        title={translate('workflows.latest-execution')}
        content={latestRunId}
        href={routeForWorkflow({
          namespace,
          workflow: workflow?.id,
          run: latestRunId,
        })}
      />
    {/if}
    <WorkflowDetail
      title={translate('common.history-size-bytes')}
      content={workflow?.historySizeBytes}
    />
    {#if !$isCloud}
      <WorkflowDetail
        title={translate('workflows.state-transitions')}
        content={workflow?.stateTransitionCount}
      />
    {/if}
  </div>
</div>
