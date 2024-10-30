<script lang="ts">
  import { page } from '$app/stores';

  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    routeForWorkers,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import WorkflowDetail from './workflow-detail.svelte';

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<div class="flex flex-col gap-2">
  <div
    class="grid w-full grid-flow-row grid-cols-1 gap-2 rounded-xl p-2 text-sm md:grid-cols-3 xl:grid-cols-4"
  >
    <WorkflowDetail
      content={elapsedTime}
      class="order-1 font-mono text-xl"
      icon="clock"
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
      class="order-2"
    />

    <div class="order-4 xl:order-5" />
    <div class="order-7 xl:hidden" />
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
      class="order-5 xl:order-6"
    />
    <WorkflowDetail
      title={translate('common.task-queue')}
      content={workflow?.taskQueue}
      class="order-6 xl:order-4"
      href={routeForWorkers({
        namespace: $page.params.namespace,
        workflow: workflow?.id,
        run: workflow?.runId,
      })}
      badge
    />
    <WorkflowDetail
      title={translate('common.workflow-type')}
      content={workflow?.name}
      copyable
      filterable
      class="order-3"
      href={routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowType="${workflow?.name}"`,
      })}
      badge
    />
    <WorkflowDetail
      title={translate('common.run-id')}
      content={workflow?.runId}
      copyable
      class="order-8 xl:order-7"
      badge
    />
    <WorkflowDetail
      title={translate('common.history-size-bytes')}
      content={workflow?.historySizeBytes}
      class="order-9 xl:order-8"
      badge
    />
    <!-- <WorkflowDetail
      title={translate('workflows.state-transitions')}
      content={workflow?.stateTransitionCount}
      class="order-8"
    /> -->
  </div>
</div>
