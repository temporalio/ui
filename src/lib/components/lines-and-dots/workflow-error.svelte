<script lang="ts">
  import AccordionGroup from '$lib/holocene/accordion/accordion-group.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingWorkflowTaskInfo } from '$lib/types';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { getErrorCause } from '$lib/utilities/get-workflow-task-failed-event';

  import { CategoryIcon } from './constants';

  import WorkflowErrorStackTrace from './workflow-error-stack-trace.svelte';
  import WorkflowPendingTask from './workflow-pending-task.svelte';

  export let error: WorkflowTaskFailedEvent;
  export let pendingTask: PendingWorkflowTaskInfo | undefined = undefined;

  let cause: WorkflowTaskFailedCause;

  $: {
    cause = getErrorCause(error);
  }
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
      <div class="flex items-center justify-between gap-2 bg-danger px-2 py-2">
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
        {#if error.attributes?.failure}
          <AccordionGroup>
            <WorkflowErrorStackTrace failure={error.attributes.failure} />
            {#if pendingTask}
              <WorkflowPendingTask {pendingTask} />
            {/if}
          </AccordionGroup>
        {/if}
      </div>
    </div>
  </Alert>
{/if}
