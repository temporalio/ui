<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PendingWorkflowTaskInfo } from '$lib/types';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { getErrorCause } from '$lib/utilities/get-workflow-task-failed-event';

  import EventDetailsFull from '../event/event-details-full.svelte';

  interface Props {
    error: WorkflowTaskFailedEvent | WorkflowTaskTimedOutEvent;
    pendingTask: PendingWorkflowTaskInfo | undefined;
  }

  // TODO: Add pending workflow task info display
  let { error }: Props = $props();

  let cause: WorkflowTaskFailedCause = $derived(getErrorCause(error));
</script>

{#if cause && cause !== 'ResetWorkflow'}
  <Alert
    icon="error"
    intent="error"
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
    <div class="my-2">
      <EventDetailsFull event={error} />
    </div>
  </Alert>
{/if}
