import { colorScales } from '$lib/theme/io/themes';

import { getLineColor } from './mark-visuals';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import type { LifecycleKind } from '../../data/lifecycle-groups/types';

export function getMarkPresentation(
  kind: LifecycleKind,
  left: number,
  right: number,
): {
  isWorkflow: boolean;
  isPoint: boolean;
  isCompact: boolean;
  showLine: boolean;
} {
  const isWorkflow = kind === 'workflow';
  const isPoint =
    kind === 'event' || kind === 'external-signal' || kind === 'update';
  const isCompact = !isWorkflow && !isPoint && right - left <= 8;

  return {
    isWorkflow,
    isPoint,
    isCompact,
    showLine: !isPoint && !isCompact && right > left,
  };
}

export function getEventPresentation(
  kind: LifecycleKind,
  eventType: QualifiedHistoryEvent['eventType'],
): { color: string; isOutcome: boolean } {
  const isTerminal =
    eventType.endsWith('Completed') ||
    eventType.endsWith('Failed') ||
    eventType.endsWith('Terminated') ||
    eventType.endsWith('TimedOut') ||
    eventType.endsWith('Canceled') ||
    eventType.endsWith('ContinuedAsNew');
  const isOutcome =
    kind === 'workflow'
      ? eventType.startsWith('WorkflowExecution') && isTerminal
      : isTerminal || eventType.endsWith('Fired');

  if (kind === 'workflow' && !isOutcome) {
    return { color: colorScales.neutral[8], isOutcome };
  }

  const fallback = isOutcome
    ? colorScales.indigo[9]
    : eventType.endsWith('Started')
      ? colorScales.zaffre[9]
      : colorScales.neutral[8];

  return { color: getLineColor(eventType, fallback), isOutcome };
}
