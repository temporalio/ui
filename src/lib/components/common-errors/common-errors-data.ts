import type {
  CommonError,
  CommonErrorCategory,
  CommonErrorSeverity,
} from '$lib/types/common-errors';

export const COMMON_ERRORS: CommonError[] = [
  {
    id: 1,
    severity: 'warning',
    title: 'Workflow Execution Timeout Set',
    description:
      'Workers cannot react to this timeout. When it fires, no cancellation or cleanup logic will run, and any pending activities will continue executing on your Workers. Consider using a Workflow timer with a detached cancellation scope or sending a cancellation request from the client for more controlled shutdowns.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-workflow-failures',
    action: 'Workflow Execution Timeout docs',
    category: 'workflow-timeouts',
  },
  {
    id: 2,
    severity: 'error',
    title: 'Execution Timeout Less Than or Equal to Run Timeout',
    description:
      'The Workflow Execution Timeout should be longer than the Workflow Run Timeout. When they are equal or the Execution Timeout is shorter, the two effectively cancel each other out and the behavior may not match expectations.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-workflow-failures',
    action: 'Workflow Timeouts docs',
    category: 'workflow-timeouts',
  },
  {
    id: 3,
    severity: 'warning',
    title: 'Very Short Execution/Run Timeout',
    description:
      "Setting a Workflow Execution or Run Timeout less than 1–2 minutes can create a large volume of server-side Timers, especially at scale. This may put pressure on your Namespace's infrastructure and could cause noisy neighbor issues for other workloads.",
    link: 'https://docs.temporal.io/encyclopedia/detecting-workflow-failures',
    action: 'Workflow Timeouts docs',
    category: 'workflow-timeouts',
  },
  {
    id: 4,
    severity: 'warning',
    title: 'Workflow Task Timeout Changed from Default',
    description:
      'The Workflow Task Timeout is set to a value other than the default of 10 seconds. Changing this is typically not recommended unless you have a specific low-latency use case. Increasing it can mask blocking code in your Workflow and delay the delivery of Signals and Updates.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-workflow-failures',
    action: 'Workflow Task Timeout docs',
    category: 'workflow-timeouts',
  },
  {
    id: 5,
    severity: 'error',
    title: 'Workflow Task Timeout Increased Above 10 Seconds',
    description:
      'Setting the Workflow Task Timeout above 10 seconds is strongly discouraged. Blocking code in your Workflow may go undetected and Signal delivery will be delayed because Signals are only delivered on Workflow Task boundaries.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-workflow-failures',
    action: 'Workflow Task Timeout docs',
    category: 'workflow-timeouts',
  },
  {
    id: 6,
    severity: 'warning',
    title: 'Workflow Task Timeout Decreased Below 10 Seconds',
    description:
      'The Workflow Task Timeout has been lowered below the default. This can be appropriate for low-latency use cases with strict SLOs, but make sure your Workflow logic can consistently complete within this window.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-workflow-failures',
    action: 'Workflow Task Timeout docs',
    category: 'workflow-timeouts',
  },
  {
    id: 7,
    severity: 'warning',
    title: 'High-Frequency Continue-as-New Detected',
    description:
      'This Workflow Execution completed and Continued-as-New in under 2 seconds. High-frequency Continue-as-New puts repeated pressure on the same infrastructure shard because the Workflow ID is preserved. Consider using a loop inside your Workflow code instead. Temporal fully supports deterministic loops.',
    link: 'https://docs.temporal.io/workflow-execution/continue-as-new',
    action: 'Continue-as-New docs',
    category: 'continue-as-new',
  },
  {
    id: 8,
    severity: 'info',
    title: 'Continue-as-New Cost Consideration',
    description:
      'Each Continue-as-New creates a new billable Workflow Execution. If you are iterating over items one at a time with Continue-as-New, processing them in a loop within a single Workflow Execution will reduce your costs significantly.',
    link: 'https://docs.temporal.io/workflow-execution/continue-as-new',
    action: 'Continue-as-New docs',
    category: 'continue-as-new',
    cloudOnly: true,
  },
  {
    id: 9,
    severity: 'info',
    title: 'Consider Using suggest_continue_as_new Instead',
    description:
      "Rather than triggering Continue-as-New on a fixed schedule, you can rely on the server's suggest_continue_as_new flag, which is set at approximately 4,000 events. This approach ensures you only Continue-as-New when the Event History is actually getting large.",
    link: 'https://docs.temporal.io/workflow-execution/continue-as-new',
    action: 'SuggestContinueAsNew docs',
    category: 'continue-as-new',
  },
  {
    id: 10,
    severity: 'warning',
    title: 'Workflow Retry Policy Defined',
    description:
      "This Workflow has a Retry Policy configured. Over 99% of use cases don't require Workflow-level retries. Consider handling errors in your Workflow code and using Continue-as-New or Workflow Reset to recover from failures.",
    link: 'https://docs.temporal.io/encyclopedia/retry-policies',
    action: 'Workflow Retry Policy docs',
    category: 'retry-policies',
  },
  {
    id: 11,
    severity: 'warning',
    title: 'Workflow Retries Start from the Beginning',
    description:
      'A Workflow retry does not resume from the point of failure. It restarts the entire Workflow from the very first step. If you need to resume from where the Workflow failed, use Workflow Reset instead.',
    link: 'https://docs.temporal.io/encyclopedia/retry-policies',
    action: 'Workflow Reset docs',
    category: 'retry-policies',
  },
  {
    id: 12,
    severity: 'warning',
    title: 'Child Workflow Retry Policy Defined',
    description:
      'This Child Workflow has a Retry Policy configured. Over 99% of use cases do not require Workflow-level retries, and this applies to Child Workflows as well. A retry will restart the Child Workflow from the very beginning, not from the point of failure. Consider handling errors in your Workflow code and using Continue-as-New or Workflow Reset to recover from failures instead.',
    link: 'https://docs.temporal.io/encyclopedia/retry-policies',
    action: 'Child Workflow docs',
    category: 'retry-policies',
  },
  {
    id: 13,
    severity: 'warning',
    title: 'No Explicit Activity Retry Policy (Infinite Retries)',
    description:
      'This Activity does not have an explicit Retry Policy, which means it will use the default: unlimited retries with no maximum attempt count. If the Activity keeps failing, it will retry indefinitely, which can lead to unexpected costs and Activities that appear stuck.',
    link: 'https://docs.temporal.io/encyclopedia/retry-policies',
    action: 'Activity Retry Policy docs',
    category: 'retry-policies',
    cloudOnly: true,
  },
  {
    id: 14,
    severity: 'error',
    title: 'Activity Max Attempts Set to 1 (Retries Disabled)',
    description:
      'Setting Max Attempts to 1 disables Activity retries entirely. Activities have an at-least-once execution guarantee, meaning the Activity Task can be lost over the network between the server and your Worker. Without retries, the Activity may never execute. If you need to prevent duplicate executions, consider using Non-Retryable Error Types for specific failure conditions instead.',
    link: 'https://docs.temporal.io/encyclopedia/retry-policies',
    action: 'Activity Retry Policy docs',
    category: 'retry-policies',
  },
  {
    id: 15,
    severity: 'info',
    title: 'Consider Using Non-Retryable Error Types',
    description:
      'If you want to stop Activity retries for specific error conditions rather than disabling retries entirely, you can throw a Non-Retryable Application Failure from your Activity code. This gives you fine-grained control over which failures should and should not be retried.',
    link: 'https://docs.temporal.io/encyclopedia/retry-policies',
    action: 'Non-Retryable Errors docs',
    category: 'retry-policies',
  },
  {
    id: 16,
    severity: 'warning',
    title: 'Activity Start-to-Close Timeout Less Than or Equal to 1 Second',
    description:
      "The Start-to-Close timeout includes not just your Activity's execution time but also the network round-trip between your Worker and the server. Setting it to 1 second or less leaves almost no margin and may cause premature timeouts even when your Activity completes successfully.",
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Timeouts docs',
    category: 'activity-timeouts',
  },
  {
    id: 17,
    severity: 'error',
    title: 'Start-to-Close Timeout Not Set',
    description:
      'You have set a Schedule-to-Close timeout but not a Start-to-Close timeout. Start-to-Close is the most important Activity timeout to set because it governs individual retry attempts. Without it, a single stuck attempt can consume the entire Schedule-to-Close window.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Timeouts docs',
    category: 'activity-timeouts',
  },
  {
    id: 18,
    severity: 'warning',
    title: 'Schedule-to-Close Too Close to Start-to-Close',
    description:
      'The Schedule-to-Close Timeout is not significantly larger than the Start-to-Close Timeout. This leaves little or no room for retry attempts. For retries to be effective, Schedule-to-Close should be a meaningful multiple of Start-to-Close.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Timeouts docs',
    category: 'activity-timeouts',
  },
  {
    id: 19,
    severity: 'error',
    title: 'Schedule-to-Close Exceeds Workflow Run Timeout',
    description:
      "Your Activity's Schedule-to-Close Timeout is longer than the Workflow Run Timeout. The server will silently cap the Schedule-to-Close to the Workflow Run Timeout value, which means your Activity may time out sooner than you expect.",
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Timeouts docs',
    category: 'activity-timeouts',
  },
  {
    id: 20,
    severity: 'warning',
    title: 'Schedule-to-Start Timeout Set',
    description:
      'The Schedule-to-Start Timeout is a non-retryable timeout. If your Workers are slow to pick up the Activity Task or restart during this window, the Activity will fail permanently with no retry. This timeout is only recommended for specialized use cases like dynamic Task Queue routing.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Schedule-to-Start Timeout docs',
    category: 'activity-timeouts',
  },
  {
    id: 21,
    severity: 'error',
    title: 'Heartbeat Timeout Greater Than or Equal to Start-to-Close Timeout',
    description:
      'Your Heartbeat Timeout is greater than or equal to your Start-to-Close Timeout. The Heartbeat will never have a chance to fire before the Activity times out, making it ineffective. Heartbeat Timeout should be well under your Start-to-Close Timeout (roughly 80% or less).',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Heartbeat docs',
    category: 'heartbeat',
  },
  {
    id: 22,
    severity: 'warning',
    title: 'Heartbeat Timeout Should Be Less Than Start-to-Close',
    description:
      'For heartbeating to be effective at detecting stuck Activities, the Heartbeat Timeout should be meaningfully shorter than the Start-to-Close Timeout. A good guideline is to set it to about 80% or less of the Start-to-Close value.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Heartbeat docs',
    category: 'heartbeat',
  },
  {
    id: 23,
    severity: 'warning',
    title: 'Heartbeat Timeout Set but No Heartbeats Detected',
    description:
      'A Heartbeat Timeout is configured for this Activity, but no Heartbeat events have been recorded. If your Activity code does not call the Heartbeat API, the timeout will eventually fire and cause the Activity to fail. Either add Heartbeat calls to your Activity or remove the Heartbeat Timeout.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Activity Heartbeat docs',
    category: 'heartbeat',
  },
  {
    id: 24,
    severity: 'warning',
    title: 'Very Long Delayed Start (First Workflow Task Backoff)',
    description:
      'This Workflow has a First Workflow Task Backoff set to a very long duration. The Workflow Execution will not begin processing until this delay expires. Please verify this is intentional.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Delayed Start docs',
    category: 'delayed-start',
  },
  {
    id: 25,
    severity: 'warning',
    title: 'Very Short Delayed Start',
    description:
      'Setting a First Workflow Task Backoff of less than 1 second provides minimal practical delay and creates a server-side timer that must be managed. At high volume, sub-second delayed starts can put unnecessary pressure on infrastructure.',
    link: 'https://docs.temporal.io/encyclopedia/detecting-activity-failures',
    action: 'Delayed Start docs',
    category: 'delayed-start',
  },
  {
    id: 26,
    severity: 'warning',
    title: 'Local Activity Extending Workflow Task',
    description:
      'A repeating pattern of WorkflowTaskScheduled, WorkflowTaskStarted, and WorkflowTaskCompleted events indicates a Local Activity is running longer than the Workflow Task Timeout and extending the task. Each extension is billed as a Workflow Task Heartbeat. Consider whether this Activity should be a regular (non-local) Activity instead.',
    link: 'https://docs.temporal.io/local-activity',
    action: 'Local Activities docs',
    category: 'local-activities',
    cloudOnly: true,
  },
  {
    id: 27,
    severity: 'info',
    title: 'Local Activities Not Batched (Cost Optimization)',
    description:
      "Each Local Activity in this Workflow is completing in its own separate Workflow Task rather than being bundled together. You lose the primary cost benefit of Local Activities when they aren't batched. Try to group multiple Local Activities within a single Workflow Task window (default 10 seconds) by accumulating work before executing.",
    link: 'https://docs.temporal.io/local-activity',
    action: 'Local Activities docs',
    category: 'local-activities',
    cloudOnly: true,
  },
  {
    id: 28,
    severity: 'warning',
    title: 'Local Activity with Unlimited Retries',
    description:
      "Local Activity retries generate events in the Workflow's Event History. If a Local Activity retries indefinitely, it can rapidly fill the Event History and push you toward the Continue-as-New threshold. Set a bounded Retry Policy for Local Activities.",
    link: 'https://docs.temporal.io/local-activity',
    action: 'Local Activities docs',
    category: 'local-activities',
  },
  {
    id: 29,
    severity: 'info',
    title: 'Local Activities May Delay Signal Processing',
    description:
      'While Local Activities are running, Signal and Update delivery can be delayed because they are processed on Workflow Task boundaries. If timely Signal handling is critical, consider using regular Activities or restructuring your Workflow to process Signals between Local Activity batches.',
    link: 'https://docs.temporal.io/local-activity',
    action: 'Local Activities docs',
    category: 'local-activities',
  },
  {
    id: 30,
    severity: 'warning',
    title: 'Local Activities Fully Retry on Workflow Task Failure',
    description:
      'If a Workflow Task times out or fails while Local Activities are in progress, those Local Activities will be completely retried from the beginning. Idempotency in your Local Activity code is critical to avoid duplicate side effects.',
    link: 'https://docs.temporal.io/local-activity',
    action: 'Local Activities docs',
    category: 'local-activities',
  },
  {
    id: 31,
    severity: 'warning',
    title: 'suggest_continue_as_new Was Ignored',
    description:
      'The server set the suggest_continue_as_new flag at approximately 4,000 events, but this Workflow continued for a significant number of additional events. Large Event Histories increase replay time and memory consumption on your Workers. Implement a check for this flag in your Workflow code and call Continue-as-New when it is set.',
    link: 'https://docs.temporal.io/workflow-execution/continue-as-new',
    action: 'SuggestContinueAsNew docs',
    category: 'event-history',
  },
  {
    id: 32,
    severity: 'info',
    title: 'Multiple Input Payloads Detected',
    description:
      'This Workflow/Activity receives multiple input payloads. We recommend using a single composite payload (such as a struct or object) instead. During replay, the Data Converter is called once per payload, so multiple payloads increase replay overhead.',
    link: 'https://docs.temporal.io/dataconversion',
    action: 'Data Converter docs',
    category: 'multiple-payloads',
  },
  {
    id: 33,
    severity: 'error',
    title: 'Workflow ID Reuse Policy: Terminate-If-Running',
    description:
      'This Workflow uses the "terminate-if-running" ID Reuse Policy. Starting a new Workflow with the same ID will forcibly terminate the currently running execution. This can cause data loss or incomplete processing if the running Workflow is mid-operation. Make sure this behavior is intentional.',
    link: 'https://docs.temporal.io/workflow-execution/workflowid-runid',
    action: 'Workflow ID Reuse Policy docs',
    category: 'workflow-id-reuse',
  },
  {
    id: 34,
    severity: 'warning',
    title: 'Workflow ID Reuse Policy Limited by Retention',
    description:
      "Your Workflow ID Reuse Policy (reject-duplicate or failed-only) is only enforced while the previous execution's records exist in the system. Once the Namespace Retention Period expires and the old execution is purged, the server can no longer enforce this check. If you need deduplication guarantees beyond your retention window, consider maintaining an external record.",
    link: 'https://docs.temporal.io/workflow-execution/workflowid-runid',
    action: 'Namespace Retention docs',
    category: 'workflow-id-reuse',
  },
  {
    id: 35,
    severity: 'info',
    title: 'Sensitive Data in Memo (Consider Using Headers)',
    description:
      'Memo fields are stored as plaintext and are visible in the UI and API responses. If you are passing sensitive information such as PII, consider using headers instead. Header values pass through the Data Converter, which supports encryption, and can be propagated using SDK interceptors.',
    link: 'https://docs.temporal.io/dataconversion',
    action: 'Headers and Context Propagation docs',
    category: 'memo-headers',
  },
];

export function getCommonErrorById(id: number): CommonError | undefined {
  return COMMON_ERRORS.find((error) => error.id === id);
}

export function getCommonErrorsByCategory(
  category: CommonErrorCategory,
): CommonError[] {
  return COMMON_ERRORS.filter((error) => error.category === category);
}
