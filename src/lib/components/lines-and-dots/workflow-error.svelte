<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PendingWorkflowTaskInfo } from '$lib/types';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import {
    getErrorCause,
    isFailedTaskEvent,
    isTimedOutTaskEvent,
  } from '$lib/utilities/get-workflow-task-failed-event';

  import { formatWorkflowFailureDiagnostic } from './workflow-failure-diagnostic';

  import WorkflowErrorStackTrace from './workflow-error-stack-trace.svelte';
  import WorkflowPendingTask from './workflow-pending-task.svelte';

  interface Props {
    error: WorkflowTaskFailedEvent | WorkflowTaskTimedOutEvent;
    pendingTask: PendingWorkflowTaskInfo | undefined;
  }

  let { error, pendingTask }: Props = $props();

  let cause: WorkflowTaskFailedCause = $derived(getErrorCause(error));
  let failure = $derived(
    isFailedTaskEvent(error)
      ? (error.attributes?.failure ?? undefined)
      : undefined,
  );
  let timeoutType = $derived(
    isTimedOutTaskEvent(error)
      ? (error.attributes?.timeoutType ?? undefined)
      : undefined,
  );
  let diagnostic = $derived(formatWorkflowFailureDiagnostic(failure));
</script>

{#if cause && cause !== 'ResetWorkflow'}
  <section
    class="surface-primary min-w-0 overflow-hidden rounded-panel border border-l-4 border-danger text-primary"
    aria-labelledby="workflow-task-alert-title"
    data-testid="workflow-task-alert"
  >
    <div
      class="surface-danger flex min-w-0 items-start gap-2 border-b border-danger px-3 py-3 sm:px-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon
        name="warning"
        class="mt-0.5 size-5 shrink-0 text-danger"
        aria-hidden="true"
      />
      <div class="min-w-0">
        <h2
          id="workflow-task-alert-title"
          class="text-sm font-semibold leading-5 text-danger"
        >
          {translate(`typed-errors.${cause}.title`)}
        </h2>
        <div
          class="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs leading-5 text-secondary"
        >
          <span>{spaceBetweenCapitalLetters(error.name)}</span>
          <span aria-hidden="true">·</span>
          <span>{translate('common.event')} {error.id}</span>
          <span aria-hidden="true">·</span>
          <Timestamp
            as="span"
            class="font-mono tabular-nums"
            dateTime={error.eventTime}
          />
        </div>
      </div>
    </div>

    <div class="flex min-w-0 flex-col">
      {#if diagnostic.transcript}
        <div class="min-w-0 px-3 py-3 sm:px-4">
          <WorkflowErrorStackTrace {failure} />
        </div>
      {/if}

      {#if timeoutType}
        <dl
          class="px-3 py-3 sm:px-4"
          class:border-t={!!diagnostic.transcript}
          class:border-subtle={!!diagnostic.transcript}
        >
          <div class="min-w-0">
            <dt class="text-xs font-medium leading-5 text-secondary">
              {translate('common.timeout-type')}
            </dt>
            <dd class="min-w-0 break-words text-sm leading-5">
              {timeoutType}
            </dd>
          </div>
        </dl>
      {/if}

      <div
        class="px-3 py-3 text-sm leading-5 text-secondary sm:px-4"
        class:border-t={!!diagnostic.transcript || !!timeoutType}
        class:border-subtle={!!diagnostic.transcript || !!timeoutType}
      >
        <p>{translate(`typed-errors.${cause}.description`)}</p>
        {#if cause === 'NonDeterministicError' || cause === 'BadSearchAttributes'}
          <p class="mt-1">
            {translate('typed-errors.link-preface')}<Link
              newTab
              href={translate(`typed-errors.${cause}.link`)}
              >{translate(`typed-errors.${cause}.action`)}</Link
            >.
          </p>
        {/if}
      </div>

      {#if pendingTask}
        <WorkflowPendingTask {pendingTask} />
      {/if}
    </div>
  </section>
{/if}
