import { colorScales } from '$lib/theme/io/themes';
import { capitalize, format } from '$lib/utilities/format-camel-case';

import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import type { LifecycleKind } from '../../data/lifecycle-groups/types';

export const outcomeColors = {
  completed: colorScales.green[9],
  failed: colorScales.red[11],
  timedOut: colorScales.persimmon[9],
  canceled: colorScales.amber[9],
  continuedAsNew: colorScales.indigo[9],
};

export function getEventLabel(
  eventType: QualifiedHistoryEvent['eventType'],
): string {
  return capitalize(format(eventType).toLowerCase());
}

export function getEventDescription(
  eventType: QualifiedHistoryEvent['eventType'],
  count: number,
): string {
  const label = getEventLabel(eventType);
  return count > 1 ? `${count} events · ${label}` : label;
}

function getOutcomeColor(
  eventType: QualifiedHistoryEvent['eventType'],
): string | undefined {
  if (eventType.endsWith('Completed') || eventType.endsWith('Fired'))
    return outcomeColors.completed;
  if (eventType.endsWith('Failed') || eventType.endsWith('Terminated'))
    return outcomeColors.failed;
  if (eventType.endsWith('TimedOut')) return outcomeColors.timedOut;
  if (eventType.endsWith('Canceled')) return outcomeColors.canceled;
  if (eventType.endsWith('ContinuedAsNew')) return outcomeColors.continuedAsNew;
  return undefined;
}

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
): {
  color: string;
  isOutcome: boolean;
  shape: 'circle' | 'diamond' | 'square';
} {
  const shape =
    eventType === 'MarkerRecorded'
      ? 'square'
      : eventType.includes('Signal') ||
          eventType.includes('Update') ||
          kind === 'external-signal' ||
          kind === 'update'
        ? 'diamond'
        : 'circle';
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
    return { color: colorScales.neutral[8], isOutcome, shape };
  }

  return {
    color: getOutcomeColor(eventType) ?? colorScales.neutral[8],
    isOutcome,
    shape,
  };
}
