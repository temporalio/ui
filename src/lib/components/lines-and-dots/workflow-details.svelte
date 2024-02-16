<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  // import { routeForWorkers } from '$lib/utilities/route-for';

  // import PayloadDecoder from '../event/payload-decoder.svelte';

  import WorkflowDetail from './workflow-detail.svelte';

  $: ({ workflow } = $workflowRun);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<div
  class="flex flex-col rounded-t border-b-4 bg-slate-900 text-white lg:flex-row"
>
  <div
    class="flex w-full flex-col items-center justify-between gap-4 border-b-4 p-2 text-sm text-white md:flex-row lg:w-1/2 lg:border-b-0 lg:border-r-4"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-1 text-xl">
        <Icon name="clock" class="scale-130" />
        {elapsedTime}
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex justify-end gap-4">
        <p class="text-slate-200">{translate('common.start')}</p>
        {formatDate(workflow?.startTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </div>
      <div class="flex justify-end gap-4">
        <p class="text-slate-200">{translate('common.end')}</p>
        {formatDate(workflow?.endTime, $timeFormat, {
          relative: $relativeTime,
        })}
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
  <!-- {#if workflow?.searchAttributes}
  <div class="mt-4 flex flex-col gap-2">
    <h3 class="font-medium">{translate('common.search-attributes')}</h3>
    <div class="h-0.5 rounded-full bg-inverse" />
    <PayloadDecoder
      value={{ searchAttributes: workflow.searchAttributes }}
      key="searchAttributes"
      let:decodedValue
    >
      <CodeBlock
        content={decodedValue}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </PayloadDecoder>
  </div>
{/if} -->
</div>
