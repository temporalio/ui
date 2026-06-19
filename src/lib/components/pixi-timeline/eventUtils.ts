export interface EventLike {
  eventType: string;
  attributes: Record<string, unknown>;
}

export function getEventIcon(event: EventLike): string {
  if (event.eventType.startsWith('GROUP_')) {
    const kind = event.eventType.slice('GROUP_'.length);
    if (kind === 'ACTIVITY') return 'A';
    if (kind === 'CHILD_WORKFLOW') return 'C';
    if (kind === 'TIMER') return 'T';
    if (kind === 'WORKFLOW_TASK') return 'W';
  }
  return (event.eventType.replace('EVENT_TYPE_', '')[0] ?? '?').toUpperCase();
}

export function getEventDisplayName(event: EventLike): string {
  const a = event.attributes;
  if (event.eventType === 'GROUP_TIMER') {
    const name = (
      a.timerStartedEventAttributes as Record<string, string> | undefined
    )?.timerId;
    return name ? `Timer ${name}` : 'Timer';
  }
  if (event.eventType === 'GROUP_WORKFLOW_TASK') return 'Workflow Task';
  if (event.eventType.includes('ACTIVITY')) {
    const s = (a.activityTaskScheduledEventAttributes ??
      a.activityTaskStartedEventAttributes) as
      | Record<string, unknown>
      | undefined;
    const name = (s?.activityType as Record<string, string> | undefined)?.name;
    if (name) return name;
  }
  if (event.eventType === 'EVENT_TYPE_MARKER_RECORDED') {
    const name = (
      a.markerRecordedEventAttributes as Record<string, unknown> | undefined
    )?.markerName as string | undefined;
    if (name) return name;
  }
  if (event.eventType === 'EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED') {
    const name = (
      a.workflowExecutionSignaledEventAttributes as
        | Record<string, unknown>
        | undefined
    )?.signalName as string | undefined;
    if (name) return name;
  }
  if (event.eventType.includes('CHILD_WORKFLOW')) {
    const cw = (a.childWorkflowExecutionStartedEventAttributes ??
      a.startChildWorkflowExecutionInitiatedEventAttributes ??
      a.childWorkflowExecutionEventAttributes) as
      | Record<string, unknown>
      | undefined;
    const name = (cw?.workflowType as Record<string, string> | undefined)?.name;
    if (name) return name;
  }
  return event.eventType
    .replace('EVENT_TYPE_', '')
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');
}

export function fitLabel(event: EventLike, maxPx: number): string {
  const icon = getEventIcon(event);
  const maxChars = Math.floor((maxPx - 8) / 6);
  if (maxChars <= 1) return icon;
  const name = getEventDisplayName(event);
  const full = `${icon} ${name}`;
  if (full.length <= maxChars) return full;
  const nameChars = Math.max(0, maxChars - 3);
  return `${icon} ${name.slice(0, nameChars)}…`;
}

export function formatDuration(ms: number): string {
  if (ms < 1_000) return `${ms.toFixed(0)}ms`;
  if (ms < 60_000) return `${(ms / 1_000).toFixed(2)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(2)}m`;
  return `${(ms / 3_600_000).toFixed(2)}h`;
}
