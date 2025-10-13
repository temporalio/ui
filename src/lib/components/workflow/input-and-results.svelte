<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import InputAndResultsPayload from './input-and-results-payload.svelte';

  type Props = {
    workflow: WorkflowExecution;
    history: WorkflowEvents;
    showTitle: boolean;
  };
  let { workflow, history, showTitle = true }: Props = $props();

  const workflowEvents = $derived(
    getWorkflowStartedCompletedAndTaskFailedEvents(history),
  );
  const isRunning = $derived(workflow?.isRunning);
</script>

<div
  class={merge('flex flex-col gap-4', showTitle && 'lg:flex-row')}
  data-testid="input-and-result"
>
  <InputAndResultsPayload
    title={translate('workflows.input')}
    content={workflowEvents.input}
    {isRunning}
    {showTitle}
  />
  <InputAndResultsPayload
    title={translate('workflows.result')}
    content={workflowEvents.results}
    {isRunning}
    {showTitle}
  />
</div>
