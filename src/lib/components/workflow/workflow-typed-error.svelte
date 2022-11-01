<script lang="ts">
  import { updating } from '$lib/stores/events';

  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';

  const WORKFLOW_TASK_FAILED_ERROR_COPY = {
    Unspecified: {
      title: '',
      copy: '',
    },
    UnhandledCommand: {
      title: 'Unhandled Command',
      copy: 'The workflow task has failed because there are new available events since the last workflow task started. A retry workflow task has been scheduled and the workflow will have a chance to handle those new events.',
    },
    BadScheduleActivityAttributes: {
      title: 'Bad Schedule Activity Attributes',
      copy: '',
    },
    BadRequestCancelActivityAttributes: {
      title: 'Bad Request Cancel Activity Attributes',
      copy: '',
    },
    BadStartTimerAttributes: {
      title: 'Bad Start Timer Attributes',
      copy: '',
    },
    BadCancelTimerAttributes: {
      title: 'Bad Cancel Timer Attributes',
      copy: '',
    },
    BadRecordMarkerAttributes: {
      title: 'Bad Record Marker Attributes',
      copy: '',
    },
    BadCompleteWorkflowExecutionAttributes: {
      title: 'Bad Complete Workflow Execution Attributes',
      copy: '',
    },
    BadFailWorkflowExecutionAttribute: {
      title: 'Bad Fail Workflow Execution Attributes',
      copy: '',
    },
    BadCancelWorkflowExecutionAttributes: {
      title: 'Bad Cancel Workflow Execution Attributes',
      copy: '',
    },
    BadRequestCancelExternalAttributes: {
      title: 'Bad Request Cancel External Attributes',
      copy: '',
    },
    BadContinueAsNewAttributes: {
      title: 'Bad Continue As New Attributes',
      copy: '',
    },
    StartTimerDuplicateId: {
      title: 'Start Timer Duplicate',
      copy: '',
    },
    ResetStickyTaskQueue: {
      title: 'Reset Sticky Task Queue',
      copy: '',
    },
    WorkflowWorkerUnhandledFailure: {
      title: 'Workflow Worker Unhandled Failure',
      copy: 'The workflow task has failed due to an unhandled failure from the workflow code.',
      actionCopy: 'deterministic constraints',
      link: 'https://docs.temporal.io/workflows/#deterministic-constraints',
    },
    BadSignalWorkflowExecutionAttributes: {
      title: 'Bad Signal Workflow Execution Attributes',
      copy: '',
    },
    BadStartChildExecutionAttributes: {
      title: 'Bad Start Child Execution Attributes',
      copy: '',
    },
    ForceCloseCommand: {
      title: 'Force Close Command',
      copy: 'The workflow task was forced to close by the server. A retry will be scheduled if this is a recoverable error.',
    },
    FailoverCloseCommand: {
      title: 'Failover Close Command',
      copy: 'The workflow task was forced to close due to a namespace failover. A retry will be scheduled automatically.',
    },
    BadSignalInputSize: {
      title: 'Bad Signal Input Size',
      copy: '',
    },
    ResetWorkflow: {
      title: 'Reset Workflow',
      copy: '',
    },
    BadBinary: {
      title: 'Bad Binary',
      copy: '',
    },
    ScheduleActivityDuplicatId: {
      title: 'Schedule Activity Duplicate ID',
      copy: 'A duplicate Activity ID is used, please check if you have specified the same ActivityID in your workflow.',
    },
    BadSearchAttributes: {
      title: 'Missing Search Attributes',
      copy: 'It looks like you might be missing search attributes, which might cause workflow tasks to continue to retry without success.',
      actionCopy: 'configuring search attributes',
      link: 'https://docs.temporal.io/concepts/what-is-a-search-attribute/',
    },
    NonDeterministicError: {
      title: 'Cause Non Deterministic Error',
      copy: 'The workflow task has failed due to non-deterministic error from workflow code. This usually means the workflow code has a non-backward compatible change without proper versioning branch.',
    },
    BadModifyWorkflowPropertiesAttributes: {
      title: '',
      copy: '',
    },
  };

  export let error: WorkflowTaskFailedCause;

  $: errorCopy = WORKFLOW_TASK_FAILED_ERROR_COPY[error] ?? {};
  $: ({ title = '', copy = '', actionCopy = '', link = '' } = errorCopy);
</script>

{#if !$updating}
  <Alert icon="warning" intent="warning" {title}>
    <p>{copy}</p>
    {#if actionCopy && link}
      <p>
        Learn more about <Link newTab href={link}>{actionCopy}</Link>
      </p>
    {/if}
  </Alert>
{/if}
