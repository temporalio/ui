<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let isRootWorkflow = false;
  export let isActive = false;

  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime || Date.now(),
    includeMilliseconds: true,
  });
</script>

<div
  class="flex w-full flex-col gap-2 p-1 text-left text-sm lg:flex-row lg:items-center"
>
  <div class="flex items-center gap-2 lg:basis-96">
    <div class="w-32 leading-4">
      <WorkflowStatus status={workflow.status} />
    </div>
    <div class="w-full leading-4">
      {#if isRootWorkflow}
        <p class="font-mono text-xs">{translate('common.type')}</p>
      {/if}
      <p>{workflow.name}</p>
    </div>
  </div>
  <div class="leading-4 lg:basis-[800px]">
    {#if isRootWorkflow}
      <p class="font-mono text-xs">{translate('common.id')}</p>
    {/if}
    <Link
      href={routeForEventHistory({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
      })}
      interactive={isActive}
    >
      {workflow.id}
    </Link>
  </div>
  <div class="hidden items-center gap-4 lg:flex lg:basis-5/12">
    <div class="leading-4">
      {#if isRootWorkflow}
        <p class="font-mono text-xs">
          {translate('common.start')}
        </p>
      {/if}
      <p>
        {formatDate(workflow?.startTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </p>
    </div>
    <div class="leading-4">
      {#if isRootWorkflow}
        <p class="min-w-12 font-mono text-xs">{translate('common.end')}</p>
      {/if}
      <p>
        {formatDate(workflow?.endTime, $timeFormat, {
          relative: $relativeTime,
        }) || '-'}
      </p>
    </div>
    <div class="leading-4">
      {#if isRootWorkflow}
        <Icon name="clock" class="h-4 w-3" />
      {/if}
      <p>{elapsedTime}</p>
    </div>
  </div>
</div>
