<script lang="ts">
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowTaskFailedEventAttributes } from '$lib/types';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import type { WorkflowTaskFailedCause } from '$lib/types/workflows';
  import { toWorkflowTaskFailureReadable } from '$lib/utilities/screaming-enums';

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

  export let error: WorkflowTaskFailedEvent;

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
    <div class="mt-2">
      <Table class="w-full table-fixed">
        <caption class="sr-only" slot="caption"
          >{translate('events.error-event')}</caption
        >
        <TableHeaderRow slot="headers">
          <td class="w-14 xl:w-10" />
          <th class="w-16 md:w-32">
            <span class="max-md:hidden"
              >{translate('common.date-and-time')}</span
            >
            <span class="md:hidden"><Icon name="clock" /></span>
          </th>
          <th class="w-44">{translate('common.event')}</th>
          <th class="w-auto xl:w-80" />
        </TableHeaderRow>
        <EventSummaryRow event={error} initialItem={error} typedError />
      </Table>
    </div>
  </Alert>
{/if}
