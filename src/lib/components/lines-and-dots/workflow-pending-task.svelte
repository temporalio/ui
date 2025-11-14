<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import type { PendingWorkflowTaskInfo } from '$lib/types';
  import { formatDate } from '$lib/utilities/format-date';

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
      <Badge
        >{formatDate(
          pendingTask.originalScheduledTime,
          $timeFormat,
          $relativeTime,
          $timestampFormat,
        )}</Badge
      >
    </p>
    <p class="flex items-center gap-4">
      {translate('workflows.scheduled-time')}
      <Badge
        >{formatDate(
          pendingTask.scheduledTime,
          $timeFormat,
          $relativeTime,
          $timestampFormat,
        )}</Badge
      >
    </p>
    <p class="flex items-center gap-4">
      {translate('workflows.started-time')}
      <Badge
        >{formatDate(
          pendingTask.startedTime,
          $timeFormat,
          $relativeTime,
          $timestampFormat,
        )}</Badge
      >
    </p>
  </div>
</Accordion>
