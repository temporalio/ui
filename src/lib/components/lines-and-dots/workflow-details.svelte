<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import WorkflowDetail from './workflow-detail.svelte';

  $: ({ workflow } = $workflowRun);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<div class="surface-secondary flex flex-col items-center rounded-t lg:flex-row">
  <div
    class="grid w-full grid-flow-row grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-3"
  >
    <WorkflowDetail
      title={translate('common.duration')}
      content={elapsedTime}
      class="order-1 text-sm"
    />
    <WorkflowDetail
      title={translate('common.start')}
      content={formatDate(workflow?.startTime, $timeFormat, {
        relative: $relativeTime,
      })}
      class="order-2 text-sm md:order-3 xl:order-4"
    />
    <WorkflowDetail
      title={translate('common.end')}
      content={workflow?.endTime
        ? formatDate(workflow?.endTime, $timeFormat, {
            relative: $relativeTime,
          })
        : '-'}
      class="order-3 text-sm md:order-5 xl:order-7"
    />
    <WorkflowDetail
      title={translate('common.task-queue')}
      content={workflow.taskQueue}
      class="order-4 text-sm md:order-8"
    />
    <WorkflowDetail
      title={translate('common.workflow-type')}
      content={workflow?.name}
      copyable
      class="order-4 text-sm md:order-2 xl:order-2"
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
