<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowDetail from '$lib/components/workflow/workflow-detail.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import {
    workflowRun,
    workflowSummaryViewOpen,
  } from '$lib/stores/workflow-run';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkers } from '$lib/utilities/route-for';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  $: ({ workflow } = $workflowRun);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime,
    includeMilliseconds: true,
  });
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
      <div class="grow overflow-hidden">
        <h3 class="font-medium">{translate('common.execution-details')}</h3>
        <div class="h-0.5 rounded-full bg-slate-900" />
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
        <h3 class="font-medium">{translate('common.task-queue')}</h3>
        <div class="h-0.5 rounded-full bg-slate-900" />
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
        <h3 class="font-medium">
          {translate('workflows.start-and-close-time')}
        </h3>
        <div class="h-0.5 rounded-full bg-slate-900" />
        <WorkflowDetail
          title={translate('common.start-time')}
          content={formatDate(workflow?.startTime, $timeFormat, {
            relative: $relativeTime,
          })}
          textSize="sm"
        />
        <WorkflowDetail
          title={translate('common.close-time')}
          content={formatDate(workflow?.endTime, $timeFormat, {
            relative: $relativeTime,
          })}
          textSize="sm"
        />
        {#if elapsedTime}
          <WorkflowDetail icon="clock" content={elapsedTime} textSize="sm" />
        {/if}
      </div>
    </div>
    {#if workflow?.searchAttributes}
      <div class="mt-4 flex flex-col gap-2">
        <h3 class="font-medium">{translate('common.search-attributes')}</h3>
        <div class="h-0.5 rounded-full bg-slate-900" />
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
    {/if}
  </Accordion>
</section>
