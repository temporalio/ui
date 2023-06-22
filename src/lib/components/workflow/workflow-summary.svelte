<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import { routeForWorkers } from '$lib/utilities/route-for';
  import { formatDate } from '$lib/utilities/format-date';

  import Accordion from '$lib/holocene/accordion.svelte';
  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import { translate } from '$lib/i18n/translate';

  $: ({ workflow } = $workflowRun);
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
        <h3 class="font-medium">{translate('workflows', 'workflow-type')}</h3>
        <div class="h-0.5 rounded-full bg-gray-900" />
        <WorkflowDetail content={workflow?.name} copyable />
        <WorkflowDetail content={workflow?.runId} copyable />
      </div>
      <div class="col-span-1">
        <h3 class="font-medium">{translate('workflows', 'task-queue')}</h3>
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
          content={formatDate(workflow?.startTime, $timeFormat)}
        />
        <WorkflowDetail
          title={translate('close-time')}
          content={formatDate(workflow?.endTime, $timeFormat)}
        />
      </div>
    </div>
  </Accordion>
</section>
