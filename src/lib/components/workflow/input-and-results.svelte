<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import InputAndResultsPayload from './input-and-results-payload.svelte';

  const workflowEvents = $derived(
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory),
  );
  const isPending = $derived(
    $workflowRun.workflow?.isRunning ||
      $workflowRun.workflow?.isPaused ||
      false,
  );
  const payloadDownloadFilenameData = $derived({
    workflowId: $workflowRun.workflow?.id ?? '',
    runId: $workflowRun.workflow?.runId ?? '',
  });
</script>

<div class="flex flex-col gap-4 lg:flex-row" data-testid="input-and-result">
  <InputAndResultsPayload
    title={translate('workflows.input')}
    content={workflowEvents.input ?? undefined}
    {isPending}
    payloadDownloadFilenameData={{
      ...payloadDownloadFilenameData,
      type: 'input',
    }}
  />
  <InputAndResultsPayload
    title={translate('workflows.result')}
    content={workflowEvents.results ?? undefined}
    {isPending}
    payloadDownloadFilenameData={{
      ...payloadDownloadFilenameData,
      type: 'result',
    }}
  />
</div>
