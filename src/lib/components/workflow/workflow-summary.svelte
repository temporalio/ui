<script lang="ts">
  import { page } from '$app/stores';
  
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkers } from '$lib/utilities/route-for';
  

  $: ({ workflow } = $workflowRun);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime,
  });
</script>

<section>
  <Accordion
    title={translate('summary')}
    icon="summary"
    open={$workflowSummaryViewOpen}
    onToggle={() => {
      $workflowSummaryViewOpen = !$workflowSummaryViewOpen;
    }}
  >
    <div
      class="grid-row-3 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:w-11/12"
    >
      <div class="col-span-1 md:col-span-2">
        <h3 class="font-medium">{translate('workflow-type')}</h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail content={workflow?.name} copyable />
        <WorkflowDetail content={workflow?.runId} copyable />
      </div>
      <div class="col-span-1">
        <h3 class="font-medium">{translate('task-queue')}</h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail
          content={workflow?.taskQueue}
          href={routeForWorkers({
            namespace: $page.params.namespace,
            workflow: workflow?.id,
            run: workflow?.runId,
          })}
          copyable
        />
        <WorkflowDetail
          title={translate('workflows', 'state-transitions')}
          content={workflow?.stateTransitionCount}
        />
      </div>
      <div class="col-span-1">
        <h3 class="font-medium">
          {translate('workflows', 'start-and-close-time')}
        </h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail
          title={translate('start-time')}
          content={formatDate(workflow?.startTime, $timeFormat, {
            relative: $relativeTime,
          })}
        />
        <WorkflowDetail
          title={translate('close-time')}
          content={formatDate(workflow?.endTime, $timeFormat, {
            relative: $relativeTime,
          })}
        />
        {#if elapsedTime}
          <span class="flex flex-row items-center pt-2">
            <Icon class="min-w-fit" name="clock" />
            <p class="truncate text-sm">
              {elapsedTime}
            </p>
          </span>
        {/if}
      </div>
    </div>
  </Accordion>
</section>
