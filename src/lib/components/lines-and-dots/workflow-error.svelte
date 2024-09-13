<script lang="ts">
  import AccordionGroup from '$lib/holocene/accordion/accordion-group.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    PendingWorkflowTaskInfo,
    WorkflowTaskFailedEventAttributes,
  } from '$lib/types';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { toWorkflowTaskFailureReadable } from '$lib/utilities/screaming-enums';

  import { CategoryIcon } from './constants';

  import WorkflowErrorStackTrace from './workflow-error-stack-trace.svelte';

  export let error: WorkflowTaskFailedEvent;
  export let pendingTask: PendingWorkflowTaskInfo | undefined = undefined;

  let cause: WorkflowTaskFailedCause;

  function getErrorCause(
    error: WorkflowTaskFailedEvent,
  ): WorkflowTaskFailedCause {
    const {
      workflowTaskFailedEventAttributes: { failure, cause },
    } = error as WorkflowTaskFailedEvent & {
      workflowTaskFailedEventAttributes: WorkflowTaskFailedEventAttributes;
    };

    if (
      failure?.applicationFailureInfo?.type === 'workflowTaskHeartbeatError'
    ) {
      return 'WorkflowTaskHeartbeatError';
    }

    return toWorkflowTaskFailureReadable(cause);
  }

  $: {
    cause = getErrorCause(error);
  }
</script>

{#if cause}
  <Alert
    icon="warning"
    intent="warning"
    title={translate(`typed-errors.${cause}.title`)}
  >
    <p>
      {translate(`typed-errors.${cause}.description`)}
    </p>
    {#if cause === 'WorkflowWorkerUnhandledFailure' || cause === 'BadSearchAttributes'}
      <p>
        {translate('typed-errors.link-preface')}<Link
          newTab
          href={translate(`typed-errors.${cause}.link`)}
          >{translate(`typed-errors.${cause}.action`)}</Link
        >.
      </p>
    {/if}
    <div
      class="mt-2 flex w-full flex-col gap-0 overflow-hidden rounded-xl border-2 border-danger"
    >
      <div class="flex items-center justify-between gap-2 bg-danger px-2 py-1">
        <div class="flex items-center gap-2">
          {error.id}
          <Icon name={CategoryIcon[error.category]} />
          <span class="font-semibold text-danger"
            >{spaceBetweenCapitalLetters(error?.name)}</span
          >
        </div>
        {formatDate(error?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </div>
      <div class="flex flex-col gap-2 bg-primary p-4">
        {#if error.attributes?.failure?.source}
          <p>{translate('common.source')}</p>
          <CodeBlock
            content={error.attributes.failure.source}
            language="text"
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/if}
        {#if error.attributes?.failure}
          <AccordionGroup>
            <WorkflowErrorStackTrace failure={error.attributes?.failure} />
          </AccordionGroup>
        {/if}
      </div>
    </div>

    {#if pendingTask}
      <div class="flex flex-col gap-2 pt-4">
        <h5>Pending Workflow Task Info</h5>
        <p>
          {translate('common.state')}
          <span class="badge">{pendingTask.state}</span>
        </p>
        <p>
          {translate('common.attempt')}
          <span class="badge">{pendingTask.attempt}</span>
        </p>
        <p>
          <span class="inline-block w-48">Original Scheduled Time</span>
          <span class="badge"
            >{formatDate(pendingTask.originalScheduledTime, $timeFormat)}</span
          >
        </p>
        <p>
          <span class="inline-block w-48">Scheduled Time</span>
          <span class="badge"
            >{formatDate(pendingTask.scheduledTime, $timeFormat)}</span
          >
        </p>
        <p>
          <span class="inline-block w-48">Started Time</span>
          <span class="badge"
            >{formatDate(pendingTask.startedTime, $timeFormat)}</span
          >
        </p>
      </div>
    {/if}
  </Alert>
{/if}
