import { getCommonErrorById } from '$lib/components/common-errors/common-errors-data';
import type { CommonError } from '$lib/types/common-errors';
import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowTaskCompletedEvent,
  isWorkflowTaskFailedEvent,
  isWorkflowTaskScheduledEvent,
  isWorkflowTaskStartedEvent,
  isWorkflowTaskTimedOutEvent,
} from '$lib/utilities/is-event-type';

const SEVERITY_ORDER: Record<string, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

const SENSITIVE_MEMO_PATTERNS =
  /(^|[^a-z])(ssn|social_security|password|passwd|secret|credit_card|creditcard|card_number|cardnumber|api_key|apikey|private_key|privatekey|access_token|accesstoken)([^a-z]|$)/i;

export function durationToSeconds(duration: unknown): number {
  if (!duration) return 0;

  if (
    typeof duration === 'object' &&
    duration !== null &&
    'seconds' in duration
  ) {
    const seconds = Number((duration as { seconds: string | number }).seconds);
    const nanos = Number((duration as { nanos?: number }).nanos);
    return (isNaN(seconds) ? 0 : seconds) + (isNaN(nanos) ? 0 : nanos / 1e9);
  }

  if (typeof duration !== 'string') return 0;

  const nsMatch = duration.match(/^(\d+\.?\d*)s$/);
  if (nsMatch) return parseFloat(nsMatch[1]);

  let total = 0;
  const parts = duration.split(', ');
  for (const part of parts) {
    const match = part.match(/^(\d+\.?\d*)\s+(\w+)$/);
    if (!match) continue;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('day')) total += value * 86400;
    else if (unit.startsWith('hour')) total += value * 3600;
    else if (unit.startsWith('minute')) total += value * 60;
    else if (unit.startsWith('second')) total += value;
    else if (unit.startsWith('millisecond')) total += value / 1000;
  }
  return total;
}

export function detectWorkflowErrors(
  workflow: WorkflowExecution,
): CommonError[] {
  const errors: CommonError[] = [];

  const addError = (id: number) => {
    const err = getCommonErrorById(id);
    if (err) errors.push(err);
  };

  const execTimeout = durationToSeconds(workflow.workflowExecutionTimeout);
  if (execTimeout > 0) {
    addError(1);
    if (execTimeout < 120) {
      addError(3);
    }
  }

  const taskTimeout = durationToSeconds(workflow.defaultWorkflowTaskTimeout);
  if (taskTimeout > 0 && taskTimeout !== 10) {
    addError(4);
    if (taskTimeout > 10) {
      addError(5);
    } else {
      addError(6);
    }
  }

  if (
    workflow.status === 'ContinuedAsNew' &&
    workflow.startTime &&
    workflow.endTime
  ) {
    const durationMs =
      new Date(workflow.endTime).getTime() -
      new Date(workflow.startTime).getTime();
    if (durationMs < 2000) {
      addError(7);
    }
  }

  // #9: CAN with low event count suggests fixed schedule instead of suggest_continue_as_new
  const historyEvents = parseInt(workflow.historyEvents, 10);
  if (
    workflow.status === 'ContinuedAsNew' &&
    historyEvents > 0 &&
    historyEvents < 2000
  ) {
    addError(9);
  }

  const startDelay = durationToSeconds(workflow.startDelay);
  if (startDelay > 0) {
    if (startDelay > 86400) {
      addError(24);
    }
    if (startDelay < 1) {
      addError(25);
    }
  }

  if (historyEvents > 10000) {
    addError(31);
  }

  // #35: Sensitive data in memo field names
  const memoFields = workflow.memo?.fields;
  if (memoFields && typeof memoFields === 'object') {
    const keys = Object.keys(memoFields);
    if (keys.some((key) => SENSITIVE_MEMO_PATTERNS.test(key))) {
      addError(35);
    }
  }

  return errors;
}

export function detectActivityErrors(
  pendingActivities: PendingActivity[],
  workflowRunTimeout = 0,
): CommonError[] {
  if (!pendingActivities?.length) return [];

  const errorIds = new Set<number>();

  for (const activity of pendingActivities) {
    const act = activity as Record<string, unknown>;
    const retryPolicy = act.retryPolicy as
      | { maximumAttempts?: number | string }
      | null
      | undefined;

    if (retryPolicy && Number(retryPolicy.maximumAttempts) === 1) {
      errorIds.add(14);
    }

    // #13: No explicit retry policy or maximumAttempts is 0 (unlimited)
    if (
      !retryPolicy ||
      !retryPolicy.maximumAttempts ||
      Number(retryPolicy.maximumAttempts) === 0
    ) {
      errorIds.add(13);
    }

    // #15: Activity is retrying — suggest non-retryable error types
    const attempt = Number(act.attempt);
    if (attempt > 3) {
      errorIds.add(15);
    }

    const startToClose = durationToSeconds(act.startToCloseTimeout);
    const scheduleToClose = durationToSeconds(act.scheduleToCloseTimeout);
    const scheduleToStart = durationToSeconds(act.scheduleToStartTimeout);
    const heartbeat = durationToSeconds(act.heartbeatTimeout);

    if (startToClose > 0 && startToClose <= 1) {
      errorIds.add(16);
    }

    if (scheduleToClose > 0 && startToClose === 0) {
      errorIds.add(17);
    }

    if (scheduleToClose > 0 && startToClose > 0) {
      const ratio = scheduleToClose / startToClose;
      if (ratio < 2) {
        errorIds.add(18);
      }
    }

    // #19: Schedule-to-Close exceeds Workflow Run Timeout
    if (
      scheduleToClose > 0 &&
      workflowRunTimeout > 0 &&
      scheduleToClose > workflowRunTimeout
    ) {
      errorIds.add(19);
    }

    if (scheduleToStart > 0) {
      errorIds.add(20);
    }

    if (heartbeat > 0 && startToClose > 0) {
      if (heartbeat >= startToClose) {
        errorIds.add(21);
      } else if (heartbeat > startToClose * 0.8) {
        errorIds.add(22);
      }
    }

    // #23: Heartbeat timeout set but no heartbeats detected
    if (heartbeat > 0 && !act.lastHeartbeatTime) {
      errorIds.add(23);
    }
  }

  return [...errorIds].map(getCommonErrorById).filter(Boolean);
}

export function detectFirstEventErrors(
  workflow: WorkflowExecution,
  firstEvent: WorkflowEvent | undefined,
): CommonError[] {
  if (!firstEvent || !isWorkflowExecutionStartedEvent(firstEvent)) return [];

  const errors: CommonError[] = [];
  const attrs = firstEvent.workflowExecutionStartedEventAttributes as
    | Record<string, unknown>
    | undefined;
  if (!attrs) return [];

  const addError = (id: number) => {
    const err = getCommonErrorById(id);
    if (err) errors.push(err);
  };

  const execTimeout = durationToSeconds(attrs.workflowExecutionTimeout);
  const runTimeout = durationToSeconds(attrs.workflowRunTimeout);
  if (execTimeout > 0 && runTimeout > 0 && execTimeout <= runTimeout) {
    addError(2);
  }

  if (runTimeout > 0 && runTimeout < 120) {
    addError(3);
  }

  const retryPolicy = attrs.retryPolicy;
  if (
    retryPolicy &&
    typeof retryPolicy === 'object' &&
    Object.keys(retryPolicy).length > 0
  ) {
    addError(10);
  }

  // #11: Workflow is actually being retried (attempt >= 2 means at least one retry)
  const attempt = Number(attrs.attempt);
  if (attempt >= 2) {
    addError(11);
  }

  const input = attrs.input;
  const payloads = Array.isArray(input)
    ? input
    : (input as { payloads?: unknown[] })?.payloads;
  if (Array.isArray(payloads) && payloads.length > 1) {
    addError(32);
  }

  const reusePolicy = String(attrs.workflowIdReusePolicy ?? '');
  if (reusePolicy.includes('TERMINATE_IF_RUNNING')) {
    addError(33);
  }
  if (
    reusePolicy.includes('REJECT_DUPLICATE') ||
    reusePolicy.includes('ALLOW_DUPLICATE_FAILED_ONLY')
  ) {
    addError(34);
  }

  return errors;
}

export function detectEventHistoryErrors(
  workflow: WorkflowExecution,
  events: WorkflowEvent[],
): CommonError[] {
  if (!events?.length) return [];

  const errorIds = new Set<number>();

  let activityScheduledCount = 0;
  let hasLocalActivityMarker = false;
  let hasSignalEvent = false;
  let hasWftFailure = false;
  let hasChildWfWithRetryPolicy = false;

  // Local activity batching analysis (#26, #27)
  let currentWftLaCount = 0;
  let consecutiveWftOnlyCycles = 0;
  let totalLaMarkers = 0;
  let wftWithLaCount = 0;
  let inWft = false;
  let currentWftHasNonLaCommand = false;

  for (const event of events) {
    // Count activity scheduled events (#8)
    if (isActivityTaskScheduledEvent(event)) {
      activityScheduledCount++;
    }

    // Detect local activity markers (#26, #27, #28, #29, #30)
    if (isLocalActivityMarkerEvent(event)) {
      hasLocalActivityMarker = true;
      totalLaMarkers++;
      if (inWft) {
        currentWftLaCount++;
      }
    }

    // Detect signal events (#29)
    if (isWorkflowExecutionSignaledEvent(event)) {
      hasSignalEvent = true;
    }

    // Detect WFT failures (#30)
    if (
      isWorkflowTaskFailedEvent(event) ||
      isWorkflowTaskTimedOutEvent(event)
    ) {
      hasWftFailure = true;
    }

    // Detect child workflow retry policies (#12)
    if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
      const attrs = (event as Record<string, unknown>)
        .startChildWorkflowExecutionInitiatedEventAttributes as
        | Record<string, unknown>
        | undefined;
      if (
        attrs?.retryPolicy &&
        typeof attrs.retryPolicy === 'object' &&
        Object.keys(attrs.retryPolicy as object).length > 0
      ) {
        hasChildWfWithRetryPolicy = true;
      }
    }

    // WFT cycle tracking for LA pattern detection (#26, #27)
    if (isWorkflowTaskScheduledEvent(event)) {
      inWft = true;
      currentWftLaCount = 0;
      currentWftHasNonLaCommand = false;
    }

    if (isWorkflowTaskStartedEvent(event)) {
      // still in WFT
    }

    if (isWorkflowTaskCompletedEvent(event)) {
      if (inWft) {
        if (currentWftLaCount > 0) {
          wftWithLaCount++;
          if (!currentWftHasNonLaCommand) {
            consecutiveWftOnlyCycles++;
          } else {
            consecutiveWftOnlyCycles = 0;
          }
        } else {
          consecutiveWftOnlyCycles = 0;
        }
      }
      inWft = false;
    }

    // Track non-LA commands within a WFT (for #26)
    if (
      inWft &&
      !isWorkflowTaskScheduledEvent(event) &&
      !isWorkflowTaskStartedEvent(event) &&
      !isWorkflowTaskCompletedEvent(event) &&
      !isLocalActivityMarkerEvent(event)
    ) {
      if (
        isActivityTaskScheduledEvent(event) ||
        isStartChildWorkflowExecutionInitiatedEvent(event)
      ) {
        currentWftHasNonLaCommand = true;
      }
    }
  }

  // #8: CAN cost — iterating one item at a time via CAN
  if (
    workflow.status === 'ContinuedAsNew' &&
    activityScheduledCount <= 2 &&
    parseInt(workflow.historyEvents, 10) < 50
  ) {
    errorIds.add(8);
  }

  // #12: Child workflow with retry policy
  if (hasChildWfWithRetryPolicy) {
    errorIds.add(12);
  }

  // #26: Local activity extending workflow task (3+ consecutive WFT-only cycles)
  if (consecutiveWftOnlyCycles >= 3) {
    errorIds.add(26);
  }

  // #27: Local activities not batched
  if (totalLaMarkers > 3 && wftWithLaCount > 0) {
    const avgLaPerWft = totalLaMarkers / wftWithLaCount;
    if (avgLaPerWft < 1.5) {
      errorIds.add(27);
    }
  }

  // #28: Local activity with unlimited retries (best-effort from marker data)
  // LA markers may contain retry info in details; check if any LA markers exist
  // without bounded retry policies. Since marker events don't reliably expose
  // retry policies, we detect this when we see LA markers and the workflow
  // has high event count relative to LA count (suggesting excessive retries).
  if (
    totalLaMarkers > 0 &&
    parseInt(workflow.historyEvents, 10) > 2000 &&
    totalLaMarkers > 20
  ) {
    errorIds.add(28);
  }

  // #29: Local activities may delay signal processing
  if (hasLocalActivityMarker && hasSignalEvent) {
    errorIds.add(29);
  }

  // #30: Local activities fully retry on WFT failure
  if (hasLocalActivityMarker && hasWftFailure) {
    errorIds.add(30);
  }

  return [...errorIds].map(getCommonErrorById).filter(Boolean);
}

export function getApplicableCommonErrors(
  workflow: WorkflowExecution,
  firstEvent: WorkflowEvent | undefined,
  eventHistory?: WorkflowEvent[],
): CommonError[] {
  if (!workflow) return [];

  // Extract workflowRunTimeout from first event for cross-reference checks
  let workflowRunTimeout = 0;
  if (firstEvent && isWorkflowExecutionStartedEvent(firstEvent)) {
    const attrs = firstEvent.workflowExecutionStartedEventAttributes as
      | Record<string, unknown>
      | undefined;
    if (attrs) {
      workflowRunTimeout = durationToSeconds(attrs.workflowRunTimeout);
    }
  }

  const workflowErrors = detectWorkflowErrors(workflow);
  const activityErrors = detectActivityErrors(
    workflow.pendingActivities,
    workflowRunTimeout,
  );
  const firstEventErrors = detectFirstEventErrors(workflow, firstEvent);
  const eventHistoryErrors = eventHistory?.length
    ? detectEventHistoryErrors(workflow, eventHistory)
    : [];

  const seen = new Set<number>();
  const all: CommonError[] = [];

  for (const error of [
    ...workflowErrors,
    ...activityErrors,
    ...firstEventErrors,
    ...eventHistoryErrors,
  ]) {
    if (!seen.has(error.id)) {
      seen.add(error.id);
      all.push(error);
    }
  }

  return all.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2),
  );
}
