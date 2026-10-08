<script lang="ts">
  import PayloadDecoder from '$lib/components/payload/payload-decoder.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isParsedPayload } from '$lib/utilities/decode-payload';
  import {
    getWorkflowStartedCompletedAndTaskFailedEvents,
    type WorkflowInputAndResults,
  } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import InputAndResultsPayload from './input-and-results-payload.svelte';
  import PayloadPreview from './payload-preview.svelte';

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

{#snippet previewContent(
  content: WorkflowInputAndResults['results'],
  pending = false,
)}
  {#if content}
    <PayloadDecoder value={content}>
      {#snippet loading()}{translate('common.loading')}{/snippet}
      {#snippet children(results)}
        {results
          .map(({ decodedValue }) =>
            stringifyWithBigInt(
              isParsedPayload(decodedValue) ? decodedValue.data : decodedValue,
              undefined,
              1,
            )?.replace(/\n\s*/g, ' '),
          )
          .join(', ') || 'null'}
      {/snippet}
      {#snippet error()}{stringifyWithBigInt(content)}{/snippet}
    </PayloadDecoder>
  {:else}
    {pending ? 'Results will appear upon completion.' : 'null'}
  {/if}
{/snippet}

<div
  class="grid min-w-0 grid-cols-1 gap-x-6 gap-y-1 lg:grid-cols-2"
  data-testid="input-and-result"
>
  <PayloadPreview title={translate('workflows.input')}>
    {#snippet preview()}{@render previewContent(workflowEvents.input)}{/snippet}
    {#snippet children(maxHeight)}
      <InputAndResultsPayload
        disableMaximize
        maxHeight={maxHeight ?? 0}
        title={translate('workflows.input')}
        content={workflowEvents.input ?? undefined}
        payloadDownloadFilenameData={{
          ...payloadDownloadFilenameData,
          type: 'input',
        }}
      />
    {/snippet}
  </PayloadPreview>
  <PayloadPreview title={translate('workflows.result')}>
    {#snippet preview()}{@render previewContent(
        workflowEvents.results,
        isPending,
      )}{/snippet}
    {#snippet children(maxHeight)}
      <InputAndResultsPayload
        disableMaximize
        maxHeight={maxHeight ?? 0}
        title={translate('workflows.result')}
        content={workflowEvents.results ?? undefined}
        {isPending}
        payloadDownloadFilenameData={{
          ...payloadDownloadFilenameData,
          type: 'result',
        }}
      />
    {/snippet}
  </PayloadPreview>
</div>
