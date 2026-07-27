<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import AccordionGroup from '$lib/holocene/accordion/accordion-group.svelte';
  import Alert from '$lib/holocene/alert.svelte';
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

  import { CategoryIcon } from './constants';

  import WorkflowErrorStackTrace from './workflow-error-stack-trace.svelte';
  import WorkflowPendingTask from './workflow-pending-task.svelte';

  interface Props {
    error: WorkflowTaskFailedEvent | WorkflowTaskTimedOutEvent;
    pendingTask: PendingWorkflowTaskInfo | undefined;
  }

  let { error, pendingTask }: Props = $props();

  let cause: WorkflowTaskFailedCause = $derived(getErrorCause(error));
  let failure = $derived(isFailedTaskEvent(error) && error.attributes?.failure);
  let timeoutType = $derived(
    isTimedOutTaskEvent(error) && error.attributes?.timeoutType,
  );
</script>

{#if cause && cause !== 'ResetWorkflow'}
  <Alert
    icon="warning"
    intent="warning"
    title={translate(`typed-errors.${cause}.title`)}
  >
    <p>
      {translate(`typed-errors.${cause}.description`)}
    </p>
    {#if cause === 'NonDeterministicError' || cause === 'BadSearchAttributes'}
      <p>
        {translate('typed-errors.link-preface')}<Link
          newTab
          href={translate(`typed-errors.${cause}.link`)}
          >{translate(`typed-errors.${cause}.action`)}</Link
        >.
      </p>
    {/if}
    <div
      class="mt-2 flex w-full flex-col gap-0 overflow-hidden border border-danger"
    >
      <div class="flex items-center justify-between gap-2 bg-danger px-2 py-2">
        <div class="flex items-center gap-2">
          {error.id}
          <Icon
            name={CategoryIcon[error.category].name}
            title={CategoryIcon[error.category].title}
          />
          <span class="font-semibold text-danger"
            >{spaceBetweenCapitalLetters(error?.name)}</span
          >
        </div>
        <Timestamp dateTime={error?.eventTime} />
      </div>
      <div class="flex flex-col gap-2 bg-primary p-4">
        {#if timeoutType}
          <p>
            <span class="mr-2 text-secondary">Timeout Type</span>
            {timeoutType}
          </p>
        {/if}
        {#if failure || pendingTask}
          <AccordionGroup>
            {#if failure}
              <WorkflowErrorStackTrace {failure} />
            {/if}
            {#if pendingTask}
              <WorkflowPendingTask {pendingTask} />
            {/if}
          </AccordionGroup>
        {/if}
      </div>
    </div>
  </Alert>
{/if}
