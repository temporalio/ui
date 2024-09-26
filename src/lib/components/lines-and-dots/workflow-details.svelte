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
  <h3 class="flex items-center">Summary</h3>
  <div
    class="surface-primary grid w-full grid-flow-row grid-cols-1 gap-2 rounded-xl border-2 border-primary p-2 md:grid-cols-2 xl:grid-cols-3"
  >
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
      class="order-1 text-sm "
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
      class="order-2 text-sm md:order-3 xl:order-4"
    />
    <WorkflowDetail
      content={elapsedTime}
      class="order-3 text-sm md:order-5 xl:order-7"
      icon="clock"
    />
    <WorkflowDetail
      title={translate('common.task-queue')}
      content={workflow?.taskQueue}
      class="order-4 text-sm md:order-8"
      href={routeForWorkers({
        namespace: $page.params.namespace,
        workflow: workflow?.id,
        run: workflow?.runId,
      })}
    />
    <WorkflowDetail
      title={translate('common.workflow-type')}
      content={workflow?.name}
      copyable
      filterable
      class="order-4 text-sm md:order-2 xl:order-2"
      href={routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowType="${workflow?.name}"`,
      })}
    />
    <WorkflowDetail
      title={translate('common.run-id')}
      content={workflow?.runId}
      copyable
      class="order-5 text-sm md:order-4 xl:order-5"
    />
    <WorkflowDetail
      title={translate('common.history-size-bytes')}
      content={workflow?.historySizeBytes}
      class="order-6 text-sm md:order-6 xl:order-3"
    />
    <WorkflowDetail
      title={translate('workflows.state-transitions')}
      content={workflow?.stateTransitionCount}
      class="order-7 text-sm md:order-8 xl:order-6"
    />
  </div>
</div>
