import type { EventGroup } from '$lib/models/event-groups/event-groups';

import type { EventStatus } from './types';

export function toPixiType(group: EventGroup): string {
  switch (group.category) {
    case 'activity':
    case 'local-activity':
      return 'GROUP_ACTIVITY';
    case 'child-workflow':
      return 'GROUP_CHILD_WORKFLOW';
    case 'timer':
      return 'GROUP_TIMER';
    default:
      break;
  }
  if (group.initialEvent.eventType === 'WorkflowTaskScheduled') {
    return 'GROUP_WORKFLOW_TASK';
  }
  return (
    'EVENT_TYPE_' +
    group.initialEvent.eventType
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '')
  );
}

export function toPixiStatus(group: EventGroup): EventStatus {
  if (group.isTerminated) return 'failed';
  if (group.isFailureOrTimedOut) return 'failed';
  if (group.isCanceled) return 'canceled';
  if (group.isPending) return 'started';
  const c = group.finalClassification ?? group.classification;
  switch (c) {
    case 'Completed':
      return 'completed';
    case 'Fired':
      return 'fired';
    case 'Signaled':
      return 'signaled';
    case 'Failed':
    case 'TimedOut':
    case 'Terminated':
      return 'failed';
    case 'Canceled':
    case 'CancelRequested':
      return 'canceled';
    case 'Started':
    case 'Open':
    case 'Running':
      return 'started';
    default:
      return 'scheduled';
  }
}
