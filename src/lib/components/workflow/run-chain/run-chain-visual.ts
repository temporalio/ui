import {
  dotColors,
  getCategoryStrokeColor,
  getStatusStrokeColor,
  strokeColor,
} from '$lib/components/lines-and-dots/colors';
import type { EventClassification } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

import type { ChainStep } from './run-chain';
import type { StepCounts } from './run-chain-summary';

const classifications: Record<string, EventClassification> = {
  Scheduled: 'Scheduled',
  Running: 'Started',
  Waiting: 'Started',
  Completed: 'Completed',
  Failed: 'Failed',
  'Timed out': 'TimedOut',
  Canceled: 'Canceled',
  Terminated: 'Terminated',
  Retrying: 'Scheduled',
  'Cancel requested': 'CancelRequested',
};

export function chainStepVisual(step: ChainStep) {
  const classification =
    step.kind === 'timer' && step.status === 'Completed'
      ? 'Fired'
      : (classifications[step.interruptedBy ?? step.status] ?? 'Unspecified');
  const retried = (step.attempts ?? 1) > 1;
  const pending = !step.closeTime && step.kind === 'activity';
  const line = strokeColor({
    category: pending ? (retried ? 'retry' : 'pending') : step.kind,
    classification,
  });
  return {
    classification,
    dot: dotColors(classification),
    retried,
    pending,
    line,
    // The same completed-with-retries gradient used by Timeline's connectors.
    background:
      retried && classification === 'Completed'
        ? `linear-gradient(255deg, ${line} 0%, ${dotColors('Failed').fill} 100%)`
        : line,
  };
}

export const chainRunColor = (status: string) =>
  getStatusStrokeColor(
    (status === 'Timed out'
      ? 'TimedOut'
      : status === 'Continued as new'
        ? 'ContinuedAsNew'
        : status) as WorkflowStatus,
  );

export function summarySegments(kind: ChainStep['kind'], counts: StepCounts) {
  return [
    {
      label:
        kind === 'timer'
          ? 'Fired'
          : kind === 'signal'
            ? 'Signaled'
            : kind === 'other'
              ? 'Recorded'
              : 'Completed',
      count: counts.completed - counts.recovered,
      color:
        kind === 'other'
          ? dotColors(undefined, 'marker').fill
          : getStatusStrokeColor(
              kind === 'timer'
                ? 'Fired'
                : kind === 'signal'
                  ? 'Signaled'
                  : 'Completed',
            ),
    },
    {
      label: 'Completed after retries',
      count: counts.recovered,
      color: `linear-gradient(255deg, ${getStatusStrokeColor('Completed')} 0%, ${dotColors('Failed').fill} 100%)`,
    },
    {
      label: 'Failed',
      count: counts.failed,
      color: getStatusStrokeColor('Failed'),
    },
    {
      label: 'Timed out',
      count: counts.timedOut,
      color: getStatusStrokeColor('TimedOut'),
    },
    {
      label: 'Canceled',
      count: counts.canceled,
      color: getStatusStrokeColor('Canceled'),
    },
    {
      label: 'Interrupted',
      count: counts.interrupted,
      color: getStatusStrokeColor('Terminated'),
    },
    {
      label: 'Pending',
      count: counts.active,
      color: getCategoryStrokeColor('pending'),
    },
  ].filter((segment) => segment.count > 0);
}
