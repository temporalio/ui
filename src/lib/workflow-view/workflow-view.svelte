<script lang="ts">
  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';

  import {
    type ExecutionIdentity,
    getExecutionKey,
  } from './data/identity-keys';

  import WorkflowHeader from './header/workflow-header.svelte';
  import InputAndResults from './input-and-results/input-and-results.svelte';
  import WorkflowTimelineLayout from './timeline/workflow-timeline-layout.svelte';
  import { useWorkflowView } from './use-workflow-view.svelte';

  let { identity }: { identity: ExecutionIdentity } = $props();

  const workflowView = useWorkflowView(() => identity);

  $effect(() => {
    workflowView.setAutoRefreshEnabled(
      page.url.searchParams.get('refresh_off') !== 'true',
    );
  });
  const executionKey = $derived(getExecutionKey(identity));
  const executionDetails = $derived(workflowView.executionDetails);
  const selectedEvents = $derived(
    workflowView.historyEvents.filter(
      (event) => event.executionKey === executionKey,
    ),
  );
</script>

<div
  class="flex min-w-0 flex-none flex-col gap-4"
  aria-busy={executionDetails.loading}
>
  {#if executionDetails.error}
    <Alert intent="error" title={translate('common.error-occurred')}>
      <div class="flex flex-col gap-2">
        <p>{executionDetails.error}</p>
        <Button
          size="sm"
          variant="secondary"
          loading={executionDetails.loading}
          onclick={() => workflowView.refreshExecutionDetails()}
        >
          {translate('common.retry')}
        </Button>
      </div>
    </Alert>
  {/if}
  {#if executionDetails.details}
    {@const details = executionDetails.details}
    <WorkflowHeader
      {identity}
      {details}
      events={selectedEvents}
      graph={workflowView.executionGraph}
      autoRefreshEnabled={workflowView.autoRefreshEnabled}
      onAutoRefreshChange={(enabled) =>
        updateEventFilterParams(page.url, { refresh_off: !enabled })}
    />
    <InputAndResults
      {identity}
      events={selectedEvents}
      isPending={details.isRunning || details.isPaused}
    />
    <WorkflowTimelineLayout {identity} {workflowView} />
  {:else if executionDetails.loading}
    <SkeletonWorkflow />
  {/if}
</div>
