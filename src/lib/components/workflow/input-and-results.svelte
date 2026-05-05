<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';

  const workflowEvents = $derived(
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory),
  );
  const isPending = $derived(
    $workflowRun.workflow.isRunning || $workflowRun.workflow.isPaused,
  );
  const payloadDownloadFilenameData = $derived({
    workflowId: $workflowRun.workflow.id,
    runId: $workflowRun.workflow.runId,
  });

  const MAX_HEIGHT = 300;
</script>

<div class="flex flex-col gap-4 lg:flex-row" data-testid="input-and-result">
  <div class="flex w-full grow flex-col gap-2">
    <h3 class="flex items-center gap-2 text-xs text-secondary">
      {translate('workflows.input')}
    </h3>
    {#if workflowEvents.input}
      <PayloadCodeBlock
        filenameData={{ ...payloadDownloadFilenameData, type: 'input' }}
        maxHeight={300}
        value={workflowEvents.input}
      />
    {:else}
      <CodeBlock
        content={isPending ? 'Results will appear upon completion.' : 'null'}
        language="text"
        copyable={false}
        maxHeight={MAX_HEIGHT}
      />
    {/if}
  </div>
  <div class="flex w-full grow flex-col gap-2">
    <h3 class="flex items-center gap-2 text-xs text-secondary">
      {translate('workflows.results')}
    </h3>
    {#if workflowEvents.results}
      <PayloadCodeBlock
        filenameData={{ ...payloadDownloadFilenameData, type: 'result' }}
        maxHeight={300}
        value={workflowEvents.results}
      />
    {:else}
      <CodeBlock
        content={isPending ? 'Results will appear upon completion.' : 'null'}
        language="text"
        copyable={false}
        maxHeight={MAX_HEIGHT}
      />
    {/if}
  </div>
</div>
