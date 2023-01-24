<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';

  const WORKFLOW_TASK_FAILED_ERROR_COPY = {
    Unspecified: {
      title: 'Unspecified',
      copy: 'The Workflow Task failed for an unknown reason.',
      contactSupport: true,
    },
    UnhandledCommand: {
      title: 'Unhandled Command',
      copy: 'The Workflow Task failed because there are new available events since the last Workflow Task started. A retry Workflow Task has been scheduled and the Workflow will have a chance to handle those new events.',
    },
    BadScheduleActivityAttributes: {
      title: 'Bad Schedule Activity Attributes',
      copy: 'The Workflow Task failed because of missing or incorrect ScheduleActivity attributes.',
    },
    BadRequestCancelActivityAttributes: {
      title: 'Bad Request Cancel Activity Attributes',
      copy: 'The Workflow Task failed because of bad RequestCancelActivity attributes. An Activity was scheduled to cancel, but the scheduled event id was never set.',
    },
    BadStartTimerAttributes: {
      title: 'Bad Start Timer Attributes',
      copy: 'The Workflow Task failed because the scheduled event is missing a timer id.',
    },
    BadCancelTimerAttributes: {
      title: 'Bad Cancel Timer Attributes',
      copy: 'The Workflow Task failed when trying to cancel a timer due to an unset timer id.',
    },
    BadRecordMarkerAttributes: {
      title: 'Bad Record Marker Attributes',
      copy: 'The Workflow Task failed because of a missing or invalid Marker name.',
    },
    BadCompleteWorkflowExecutionAttributes: {
      title: 'Bad Complete Workflow Execution Attributes',
      copy: 'The Workflow Task failed because of an unset attribute on CompleteWorkflowExecution.',
    },
    BadFailWorkflowExecutionAttribute: {
      title: 'Bad Fail Workflow Execution Attributes',
      copy: 'The Workflow Task failed because of an unset FailWorkflowExecution attribute or failure.',
    },
    BadCancelWorkflowExecutionAttributes: {
      title: 'Bad Cancel Workflow Execution Attributes',
      copy: 'The Workflow Task failed because of an unset attribute on CancelWorkflowExecution.',
    },
    BadRequestCancelExternalAttributes: {
      title: 'Bad Request Cancel External Attributes',
      copy: 'The Workflow Task failed due to an invalid attribute on a request to cancel an external Workflow. Check the Failure Message for more details.',
    },
    BadContinueAsNewAttributes: {
      title: 'Bad Continue As New Attributes',
      copy: 'The Workflow Task failed because it failed to validate on a ContinueAsNew attribute. Check the Failure Message for more details.',
    },
    StartTimerDuplicateId: {
      title: 'Start Timer Duplicate',
      copy: 'The Workflow Task failed because a timer with the given timer id has already started.',
    },
    ResetStickyTaskQueue: {
      title: 'Reset Sticky Task Queue',
      copy: 'The Workflow Task failed because the Sticky Task Queue needs to be reset. The system will automatically retry.',
    },
    WorkflowWorkerUnhandledFailure: {
      title: 'Workflow Worker Unhandled Failure',
      copy: 'The Workflow Task failed due to an unhandled failure from the Workflow code.',
      actionCopy: 'deterministic constraints',
      link: 'https://docs.temporal.io/workflows/#deterministic-constraints',
    },
    WorkflowTaskHeartbeatError: {
      title: 'Workflow Task Heartbeat Error',
      copy: 'The Workflow Task failed to send a heartbeat while executing long-running local Activities. These local Activities will re-execute on the next Workflow Task attempt. If this error is persistent, these local Activities will run repeatedly until the Workflow times out.',
    },
    BadSignalWorkflowExecutionAttributes: {
      title: 'Bad Signal Workflow Execution Attributes',
      copy: 'The Workflow Task failed to validate attributes for SignalWorkflowExecution. Check the Failure Message for more details.',
    },
    BadStartChildExecutionAttributes: {
      title: 'Bad Start Child Execution Attributes',
      copy: 'The Workflow Task failed to validate attributes needed for StartChildWorkflowExecution. Check the Failure Message for more details.',
    },
    ForceCloseCommand: {
      title: 'Force Close Command',
      copy: 'The Workflow Task was forced to close. A retry will be scheduled if the error is recoverable.',
    },
    FailoverCloseCommand: {
      title: 'Failover Close Command',
      copy: 'The Workflow Task was forced to close due to a Namespace failover. A retry will be scheduled automatically.',
    },
    BadSignalInputSize: {
      title: 'Bad Signal Input Size',
      copy: 'The payload has exceeded the available input size on a Signal.',
    },
    ResetWorkflow: {
      title: 'Reset Workflow',
      copy: 'The system failed this Workflow Task. If a reset for this Workflow was requested check the progress on the new Workflow, otherwise reset this Workflow.',
    },
    BadBinary: {
      title: 'Bad Binary',
      copy: 'The system failed this Workflow Task because the deployment of this Worker is marked as bad binary.',
    },
    ScheduleActivityDuplicatId: {
      title: 'Schedule Activity Duplicate ID',
      copy: 'The Workflow Task failed because the Activity ID is already in use, please check if you have specified the same Activity ID in your workflow.',
    },
    BadSearchAttributes: {
      title: 'Bad Search Attributes',
      copy: 'A Search attribute is either missing or the value exceeds the limit. This might cause Workflow tasks to continue to retry without success.',
      actionCopy: 'configuring search attributes',
      link: 'https://docs.temporal.io/visibility#search-attribute',
    },
    NonDeterministicError: {
      title: 'Non Deterministic Error',
      copy: 'A non-deterministic error has caused the Workflow Task to fail. This usually means the workflow code has a non-backward compatible change without a proper versioning branch.',
    },
    BadModifyWorkflowPropertiesAttributes: {
      title: 'Bad Modify Workflow Properties Attributes',
      copy: 'The Workflow Task failed to validate attributes on ModifyWorkflowProperty on the upsert memo. Check the Failure Message for more details.',
    },
    PendingChildWorkflowsLimitExceeded: {
      title: 'Pending Child Workflows Limit Exceeded',
      copy: 'The capacity for pending child Workflows has been reached. The Workflow Task was failed to prevent any more child Workflows from being added.',
    },
    PendingActivitiesLimitExceeded: {
      title: 'Pending Activities Limit Exceeded',
      copy: 'The capacity for pending Activities has been reached. The Workflow Task was failed to prevent another Activity from being created.',
    },
    PendingSignalsLimitExceeded: {
      title: 'Pending Signals Limit Exceeded',
      copy: 'The capacity for pending Signals to be sent from this Workflow has been reached.',
    },
    PendingRequestCancelLimitExceeded: {
      title: 'Pending Request Cancel Limit Exceeded',
      copy: 'The capacity for pending requests to cancel other Workflows has been reached.',
    },
  };

  function getErrorCause(
    error: WorkflowTaskFailedEvent,
  ): WorkflowTaskFailedCause | 'WorkflowTaskHeartbeatError' {
    if (!error || !error.workflowTaskFailedEventAttributes) {
      return;
    }

    const {
      workflowTaskFailedEventAttributes: { failure, cause },
    } = error;

    if (
      failure?.applicationFailureInfo?.type === 'workflowTaskHeartbeatError'
    ) {
      return 'WorkflowTaskHeartbeatError';
    }
    return cause;
  }

  export let error: WorkflowTaskFailedEvent;

  $: cause = getErrorCause(error);
  $: errorCopy = WORKFLOW_TASK_FAILED_ERROR_COPY[cause] ?? {};
  $: ({
    title = '',
    copy = '',
    actionCopy = '',
    link = '',
    contactSupport = false,
  } = errorCopy);
</script>

{#if title || copy}
  <Alert bold icon="warning" intent="warning" {title}>
    <p>
      {copy}
      {#if contactSupport}
        Please <Link newTab href="http://support.temporal.io/"
          >contact support</Link
        >.
      {/if}
    </p>
    {#if actionCopy && link}
      <p>
        Learn more about <Link newTab href={link}>{actionCopy}</Link>.
      </p>
    {/if}
    <div class="mt-2 bg-white">
      <Table class="dark w-full table-fixed">
        <TableHeaderRow slot="headers">
          <th class="table-cell w-14 xl:w-10" />
          <th class="table-cell w-14 md:w-28">Date & Time</th>
          <th class="table-cell w-44">Event</th>
          <th class="table-cell w-auto xl:w-80" />
        </TableHeaderRow>
        <EventSummaryRow
          event={error}
          initialItem={error}
          visibleItems={[error]}
          typedError
        />
      </Table>
    </div>
  </Alert>
{/if}
