<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import type { PendingWorkflowTaskInfo } from '$lib/types';

  interface Props {
    pendingTask?: PendingWorkflowTaskInfo | undefined;
  }

  let { pendingTask = undefined }: Props = $props();
</script>

<Accordion
  title={translate('workflows.pending-workflow-task')}
  class="border-tertiary bg-background-primary"
>
  {#if pendingTask}
    <div class="flex flex-col gap-2">
      <p class="flex items-center gap-4">
        {translate('common.state')}
        <Badge text={String(pendingTask.state)} />
      </p>
      <p class="flex items-center gap-4">
        {translate('common.attempt')}
        <Badge text={String(pendingTask.attempt)} />
      </p>
      <p class="flex items-center gap-4">
        {translate('workflows.original-scheduled-time')}
        <Badge text={$timestamp(pendingTask.originalScheduledTime)} />
      </p>
      <p class="flex items-center gap-4">
        {translate('workflows.scheduled-time')}
        <Badge text={$timestamp(pendingTask.scheduledTime)} />
      </p>
      <p class="flex items-center gap-4">
        {translate('workflows.started-time')}
        <Badge text={$timestamp(pendingTask.startedTime)} />
      </p>
    </div>
  {/if}
</Accordion>
