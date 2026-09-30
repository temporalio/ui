import { colorScales } from '$lib/theme/io/themes';

import type { ExecutionHistoryState } from '../../data/execution-history/types';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';

type EventType = QualifiedHistoryEvent['eventType'];
type LoadStatus = ExecutionHistoryState['load']['status'];

export function getWorkflowStatus(
  eventType: EventType | undefined,
  loadStatus: LoadStatus | undefined,
): Readonly<{ label: string; color: string }> {
  if (loadStatus === 'failed')
    return { label: 'History unavailable', color: colorScales.neutral[9] };
  if (loadStatus === 'pending' || loadStatus === 'loading' || !loadStatus)
    return { label: 'Loading history', color: colorScales.neutral[9] };
  if (eventType === 'WorkflowExecutionContinuedAsNew')
    return { label: 'Continued as new', color: colorScales.indigo[9] };
  if (eventType === 'WorkflowExecutionCompleted')
    return { label: 'Completed', color: colorScales.green[9] };
  if (
    eventType === 'WorkflowExecutionFailed' ||
    eventType === 'WorkflowExecutionTerminated'
  )
    return {
      label: eventType === 'WorkflowExecutionFailed' ? 'Failed' : 'Terminated',
      color: colorScales.red[9],
    };
  if (eventType === 'WorkflowExecutionTimedOut')
    return { label: 'Timed out', color: colorScales.persimmon[9] };
  if (eventType === 'WorkflowExecutionCanceled')
    return { label: 'Canceled', color: colorScales.amber[9] };
  return { label: 'Running', color: colorScales.blue[9] };
}
