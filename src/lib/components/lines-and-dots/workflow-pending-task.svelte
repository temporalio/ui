<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timestamp } from '$lib/runes/timestamp.svelte';
  import type { PendingWorkflowTaskInfo } from '$lib/types';

  export let pendingTask: PendingWorkflowTaskInfo | undefined = undefined;
</script>

<Accordion title={translate('workflows.pending-workflow-task')}>
  <div class="flex flex-col gap-2">
    <p class="flex items-center gap-4">
      {translate('common.state')}
      <Badge>{pendingTask.state}</Badge>
    </p>
    <p class="flex items-center gap-4">
      {translate('common.attempt')}
      <Badge>{pendingTask.attempt}</Badge>
    </p>
    <p class="flex items-center gap-4">
      {translate('workflows.original-scheduled-time')}
      <Badge>{$timestamp(pendingTask.originalScheduledTime)}</Badge>
    </p>
    <p class="flex items-center gap-4">
      {translate('workflows.scheduled-time')}
      <Badge>{$timestamp(pendingTask.scheduledTime)}</Badge>
    </p>
    <p class="flex items-center gap-4">
      {translate('workflows.started-time')}
      <Badge>{$timestamp(pendingTask.startedTime)}</Badge>
    </p>
  </div>
</Accordion>
