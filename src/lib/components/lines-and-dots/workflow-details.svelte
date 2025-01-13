<script lang="ts">
  import { page } from '$app/stores';

  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    routeForWorkers,
    routeForWorkflow,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import WorkflowDetail from './workflow-detail.svelte';

  export let workflow: WorkflowExecution;

  $: ({ namespace } = $page.params);

  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<div class="flex w-full flex-col gap-2 xl:flex-row xl:gap-16">
  <div class="flex w-full flex-col gap-2 xl:w-1/3">
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
  <div class="flex w-full flex-col gap-2 xl:w-1/3">
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
  <div class="flex w-full flex-col gap-2 xl:w-1/3">
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
    <WorkflowDetail
      title={translate('common.history-size-bytes')}
      content={workflow?.historySizeBytes}
    />
  </div>
</div>
