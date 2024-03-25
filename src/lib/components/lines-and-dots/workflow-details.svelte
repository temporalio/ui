<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
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

<div class="surface-secondary flex flex-col rounded-t lg:flex-row">
  <div
    class="flex w-full flex-col items-center justify-between gap-4 p-2 text-sm md:flex-row lg:w-1/2"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-1 text-xl">
        <Icon name="clock" class="scale-130" />
        {elapsedTime}
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-end gap-4">
        <p class="text-primary">{translate('common.start')}</p>
        <p class="rounded bg-ultraviolet px-1 text-white">
          {formatDate(workflow?.startTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      </div>
      <div class="flex items-center justify-end gap-4">
        <p class="text-primary">{translate('common.end')}</p>
        <p class="rounded bg-ultraviolet px-1 text-white">
          {formatDate(workflow?.endTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>
      </div>
    </div>
  </div>
  <div class="grids-col-1 grid w-full gap-0 p-2 lg:w-1/2 lg:grid-cols-2">
    <WorkflowDetail
      title={translate('common.workflow-type')}
      content={workflow?.name}
      copyable
      textSize="sm"
    />
    <WorkflowDetail
      title={translate('common.run-id')}
      content={workflow?.runId}
      copyable
      textSize="sm"
    />
    <WorkflowDetail
      title={translate('common.history-size-bytes')}
      content={workflow?.historySizeBytes}
      copyable
      textSize="sm"
    />
    <WorkflowDetail
      title={translate('workflows.state-transitions')}
      content={workflow?.stateTransitionCount}
      textSize="sm"
    />
  </div>
</div>
