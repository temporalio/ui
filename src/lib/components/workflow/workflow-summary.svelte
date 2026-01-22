<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timestamp } from '$lib/stores/timestamp';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkers } from '$lib/utilities/route-for';

  $: ({ workflow } = $workflowRun);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime,
    includeMilliseconds: true,
  });

  $: startTimestamp = $timestamp(workflow?.startTime);

  $: endTimestamp = $timestamp(workflow?.endTime);
</script>

<section>
  <Accordion
    title={translate('common.summary')}
    icon="summary"
    data-testid="summary-accordion"
    open={$workflowSummaryViewOpen}
    onToggle={() => {
      $workflowSummaryViewOpen = !$workflowSummaryViewOpen;
    }}
  >
    <div class="flex flex-col gap-2 xl:flex-row">
      <div class="grow basis-1/3 overflow-hidden">
        <h4>{translate('common.execution-details')}</h4>
        <div class="h-0.5 rounded-full bg-inverse"></div>
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
      </div>
      <div class="grow overflow-hidden">
        <h4>{translate('common.task-queue')}</h4>
        <div class="h-0.5 rounded-full bg-inverse"></div>
        <WorkflowDetail
          content={workflow?.taskQueue}
          href={routeForWorkers({
            namespace: $page.params.namespace,
            workflow: workflow?.id,
            run: workflow?.runId,
          })}
          copyable
          textSize="sm"
        />
        <WorkflowDetail
          title={translate('workflows.state-transitions')}
          content={workflow?.stateTransitionCount}
          textSize="sm"
        />
      </div>
      <div class="grow-0">
        <h4>
          {translate('workflows.start-and-close-time')}
        </h4>
        <div class="h-0.5 rounded-full bg-inverse"></div>
        <WorkflowDetail
          title={translate('common.start-time')}
          tooltip={startTimestamp}
          content={startTimestamp}
          textSize="sm"
        />
        <WorkflowDetail
          title={translate('common.close-time')}
          tooltip={endTimestamp}
          content={endTimestamp}
          textSize="sm"
        />
        {#if elapsedTime}
          <WorkflowDetail icon="clock" content={elapsedTime} textSize="sm" />
        {/if}
      </div>
    </div>
  </Accordion>
</section>
