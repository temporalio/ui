<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PendingWorkflowTaskInfo } from '$lib/types';

  interface Props {
    pendingTask?: PendingWorkflowTaskInfo | undefined;
  }

  let { pendingTask = undefined }: Props = $props();
</script>

{#snippet metadata(value: string)}
  {#if value}
    <span
      class="rounded-sm border border-primary bg-surface-secondary px-1.5 py-0.5 text-secondary"
    >
      {value}
    </span>
  {/if}
{/snippet}

<Accordion
  title={translate('workflows.pending-workflow-task')}
  class="border-tertiary bg-background-primary"
>
  {#if pendingTask}
    <div class="flex flex-col gap-2">
      <p class="flex items-center gap-4">
        {translate('common.state')}
        {@render metadata(String(pendingTask.state))}
      </p>
      <p class="flex items-center gap-4">
        {translate('common.attempt')}
        {@render metadata(String(pendingTask.attempt))}
      </p>
      <p class="flex items-center gap-4">
        {translate('workflows.original-scheduled-time')}
        {@render metadata($timestamp(pendingTask.originalScheduledTime))}
      </p>
      <p class="flex items-center gap-4">
        {translate('workflows.scheduled-time')}
        {@render metadata($timestamp(pendingTask.scheduledTime))}
      </p>
      <p class="flex items-center gap-4">
        {translate('workflows.started-time')}
        {@render metadata($timestamp(pendingTask.startedTime))}
      </p>
    </div>
  {/if}
</Accordion>
