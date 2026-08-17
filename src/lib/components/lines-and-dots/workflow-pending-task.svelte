<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PendingWorkflowTaskInfo } from '$lib/types';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  interface Props {
    pendingTask?: PendingWorkflowTaskInfo | undefined;
  }

  let { pendingTask = undefined }: Props = $props();
</script>

{#if pendingTask}
  <section
    class="border-t border-subtle px-3 py-3 sm:px-4"
    aria-labelledby="pending-workflow-task-title"
  >
    <h3
      id="pending-workflow-task-title"
      class="text-xs font-medium text-secondary"
    >
      {translate('workflows.pending-workflow-task')}
    </h3>
    <dl
      class="workflow-task-details mt-2 grid gap-x-6 gap-y-3"
      aria-label={translate('workflows.workflow-task-failure-details')}
    >
      <div class="min-w-0">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('common.state')}
        </dt>
        <dd class="min-w-0 break-words text-sm leading-5">
          {fromScreamingEnum(pendingTask.state, 'PendingWorkflowTaskState') ||
            '—'}
        </dd>
      </div>
      <div class="min-w-0">
        <dt class="text-xs font-medium leading-5 text-secondary">
          {translate('common.attempt')}
        </dt>
        <dd class="min-w-0 font-mono text-sm tabular-nums leading-5">
          {pendingTask.attempt ?? '—'}
        </dd>
      </div>
      {#if pendingTask.originalScheduledTime}
        <div class="min-w-0">
          <dt class="text-xs font-medium leading-5 text-secondary">
            {translate('workflows.original-scheduled-time')}
          </dt>
          <dd
            class="min-w-0 break-words font-mono text-sm tabular-nums leading-5"
          >
            <Timestamp dateTime={pendingTask.originalScheduledTime} />
          </dd>
        </div>
      {/if}
      {#if pendingTask.scheduledTime}
        <div class="min-w-0">
          <dt class="text-xs font-medium leading-5 text-secondary">
            {translate('workflows.scheduled-time')}
          </dt>
          <dd
            class="min-w-0 break-words font-mono text-sm tabular-nums leading-5"
          >
            <Timestamp dateTime={pendingTask.scheduledTime} />
          </dd>
        </div>
      {/if}
      {#if pendingTask.startedTime}
        <div class="min-w-0">
          <dt class="text-xs font-medium leading-5 text-secondary">
            {translate('workflows.started-time')}
          </dt>
          <dd
            class="min-w-0 break-words font-mono text-sm tabular-nums leading-5"
          >
            <Timestamp dateTime={pendingTask.startedTime} />
          </dd>
        </div>
      {/if}
    </dl>
  </section>
{/if}

<style>
  .workflow-task-details {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  }
</style>
