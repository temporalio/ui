<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import type { WorkflowTaskFailedEvent } from '$lib/types/events';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowTaskFailedCause } from '$lib/types';
  import type { I18nKey } from '$lib/i18n';

  type CopyKeys = {
    title: I18nKey<'typed-errors'>;
    description: I18nKey<'typed-errors'>;
    action?: I18nKey<'typed-errors'>;
    link?: I18nKey<'typed-errors'>;
  };

  const WORKFLOW_TASK_FAILED_ERROR_COPY_KEYS: Record<string, CopyKeys> = {
    Unspecified: {
      title: 'unspecified-title',
      description: 'unspecified-description',
    },
    UnhandledCommand: {
      title: 'unhandled-command-title',
      description: 'unhandled-command-description',
    },
    BadScheduleActivityAttributes: {
      title: 'bad-schedule-activity-attributes-title',
      description: 'bad-schedule-activity-attributes-description',
    },
    BadRequestCancelActivityAttributes: {
      title: 'bad-request-cancel-activity-attributes-title',
      description: 'bad-request-cancel-activity-attributes-desccription',
    },
    BadStartTimerAttributes: {
      title: 'bad-start-timer-attributes-title',
      description: 'bad-start-timer-attributes-description',
    },
    BadCancelTimerAttributes: {
      title: 'bad-cancel-timer-attributes-title',
      description: 'bad-cancel-timer-attributes-description',
    },
    BadRecordMarkerAttributes: {
      title: 'bad-record-marker-attributes-title',
      description: 'bad-record-marker-attributes-description',
    },
    BadCompleteWorkflowExecutionAttributes: {
      title: 'bad-complete-workflow-execution-attributes-title',
      description: 'bad-complete-workflow-execution-attributes-description',
    },
    BadFailWorkflowExecutionAttributes: {
      title: 'bad-fail-workflow-execution-attributes-title',
      description: 'bad-fail-workflow-execution-attributes-description',
    },
    BadCancelWorkflowExecutionAttributes: {
      title: 'bad-cancel-workflow-execution-attributes-title',
      description: 'bad-cancel-workflow-execution-attributes-description',
    },
    BadRequestCancelExternalAttributes: {
      title: 'bad-request-cancel-external-attributes-title',
      description: 'bad-request-cancel-external-attributes-description',
    },
    BadContinueAsNewAttributes: {
      title: 'bad-continue-as-new-attributes-title',
      description: 'bad-continue-as-new-attributes-description',
    },
    StartTimerDuplicateId: {
      title: 'start-timer-duplicate-id-title',
      description: 'start-timer-duplicate-id-description',
    },
    ResetStickyTaskQueue: {
      title: 'reset-sticky-task-queue-title',
      description: 'reset-sticky-task-queue-description',
    },
    WorkflowWorkerUnhandledFailure: {
      title: 'workflow-worker-unhandled-failure-title',
      description: 'workflow-worker-unhandled-failure-description',
      action: 'workflow-worker-unhandled-failure-action',
      link: 'workflow-worker-unhandled-failure-link',
    },
    WorkflowTaskHeartbeatError: {
      title: 'workflow-task-heartbeat-error-title',
      description: 'workflow-task-heartbeat-error-description',
    },
    BadSignalWorkflowExecutionAttributes: {
      title: 'bad-signal-workflow-execution-attributes-title',
      description: 'bad-signal-workflow-execution-attributes-description',
    },
    BadStartChildExecutionAttributes: {
      title: 'bad-start-child-execution-attributes-title',
      description: 'bad-start-child-execution-attributes-description',
    },
    ForceCloseCommand: {
      title: 'force-close-command-title',
      description: 'force-close-command-description',
    },
    FailoverCloseCommand: {
      title: 'failover-close-command-title',
      description: 'failover-close-command-description',
    },
    BadSignalInputSize: {
      title: 'bad-signal-input-size-title',
      description: 'bad-signal-input-size-description',
    },
    ResetWorkflow: {
      title: 'reset-workflow-title',
      description: 'reset-workflow-description',
    },
    BadBinary: {
      title: 'bad-binary-title',
      description: 'bad-binary-description',
    },
    ScheduleActivityDuplicateId: {
      title: 'schedule-activity-duplicate-id-title',
      description: 'schedule-activity-duplicate-id-description',
    },
    BadSearchAttributes: {
      title: 'bad-search-attributes-title',
      description: 'bad-search-attributes-description',
      action: 'bad-search-attributes-action',
      link: 'bad-search-attributes-link',
    },
    NonDeterministicError: {
      title: 'non-deterministic-error-title',
      description: 'non-deterministic-error-description',
    },
    BadModifyWorkflowPropertiesAttributes: {
      title: 'bad-modify-workflow-properties-attributes-title',
      description: 'bad-modify-workflow-properties-attributes-description',
    },
    PendingChildWorkflowsLimitExceeded: {
      title: 'pending-child-workflows-limit-exceeded-title',
      description: 'pending-child-workflows-limit-exceeded-description',
    },
    PendingActivitiesLimitExceeded: {
      title: 'pending-activities-limit-exceeded-title',
      description: 'pending-activities-limit-exceeded-description',
    },
    PendingSignalsLimitExceeded: {
      title: 'pending-signals-limit-exceeded-title',
      description: 'pending-signals-limit-exceeded-description',
    },
    PendingRequestCancelLimitExceeded: {
      title: 'pending-request-cancel-limit-exceeded-title',
      description: 'pending-request-cancel-limit-exceeded-description',
    },
    BadUpdateWorkflowExecutionMessage: {
      title: 'bad-update-workflow-execution-message-title',
      description: 'bad-update-workflow-execution-message-description',
    },
    UnhandledUpdate: {
      title: 'unhandled-update-title',
      description: 'unhandled-update-description',
    },
  };

  function getErrorCause(
    error: WorkflowTaskFailedEvent,
  ): WorkflowTaskFailedCause | 'WorkflowTaskHeartbeatError' {
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

  let title: I18nKey<'typed-errors'>;
  let description: I18nKey<'typed-errors'>;
  let action: I18nKey<'typed-errors'> | undefined;
  let link: I18nKey<'typed-errors'> | undefined;

  $: {
    const cause = getErrorCause(error);
    const errorCopyKeys = WORKFLOW_TASK_FAILED_ERROR_COPY_KEYS[cause];
    ({ title, description, action, link } = errorCopyKeys);
  }
</script>

{#if title && description}
  <Alert
    bold
    icon="warning"
    intent="warning"
    title={translate('typed-errors', title)}
    role="status"
  >
    <p>
      {translate('typed-errors', description)}
    </p>
    {#if action && link}
      <p>
        {translate('typed-errors', 'link-preface')}<Link
          newTab
          href={translate('typed-errors', link)}
          >{translate('typed-errors', action)}</Link
        >.
      </p>
    {/if}
    <div class="mt-2 bg-white">
      <Table class="dark w-full table-fixed">
        <TableHeaderRow slot="headers">
          <th class="w-14 xl:w-10" />
          <th class="w-16 md:w-32">
            <span class="max-md:hidden">{translate('date-and-time')}</span>
            <span class="md:hidden"><Icon name="clock" /></span>
          </th>
          <th class="w-44">{translate('event')}</th>
          <th class="w-auto xl:w-80" />
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
