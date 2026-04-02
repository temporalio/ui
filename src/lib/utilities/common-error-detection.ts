import { getCommonErrorById } from '$lib/components/common-errors/common-errors-data';
import type { CommonError } from '$lib/types/common-errors';
import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { isWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

const SEVERITY_ORDER: Record<string, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

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

  const startDelay = durationToSeconds(workflow.startDelay);
  if (startDelay > 0) {
    if (startDelay > 86400) {
      addError(24);
    }
    if (startDelay < 1) {
      addError(25);
    }
  }

  const historyEvents = parseInt(workflow.historyEvents, 10);
  if (historyEvents > 10000) {
    addError(31);
  }

  return errors;
}

export function detectActivityErrors(
  pendingActivities: PendingActivity[],
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

export function getApplicableCommonErrors(
  workflow: WorkflowExecution,
  firstEvent: WorkflowEvent | undefined,
): CommonError[] {
  if (!workflow) return [];

  const workflowErrors = detectWorkflowErrors(workflow);
  const activityErrors = detectActivityErrors(workflow.pendingActivities);
  const firstEventErrors = detectFirstEventErrors(workflow, firstEvent);

  const seen = new Set<number>();
  const all: CommonError[] = [];

  for (const error of [
    ...workflowErrors,
    ...activityErrors,
    ...firstEventErrors,
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
