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

const flowOrder: ChainStep['kind'][] = [
  'activity',
  'local-activity',
  'child-workflow',
  'timer',
  'signal',
  'update',
  'nexus',
  'other',
];

export type FlowLayer = {
  kind: ChainStep['kind'];
  top: number;
  height: number;
};

export const flowThickness = (total: number, max: number) =>
  total > 0 ? 0.35 + (0.65 * Math.min(total, max)) / Math.max(1, max) : 0;

export function flowLayers(
  primitives: { kind: ChainStep['kind']; counts: Pick<StepCounts, 'total'> }[],
  thickness: number,
): FlowLayer[] {
  const present = primitives
    .filter((primitive) => primitive.counts.total > 0)
    .sort((a, b) => flowOrder.indexOf(a.kind) - flowOrder.indexOf(b.kind));
  const total = present.reduce((sum, { counts }) => sum + counts.total, 0);
  const minimumShare = Math.min(0.12, 1 / Math.max(1, present.length));
  const sharedShare = 1 - minimumShare * present.length;
  let top = 0.5 - thickness / 2;
  return present.map(({ kind, counts }) => {
    const height =
      thickness * (minimumShare + (sharedShare * counts.total) / total);
    const layer = { kind, top, height };
    top += height;
    return layer;
  });
}

function collapsedLayer(layers: FlowLayer[], kind: ChainStep['kind']) {
  const next = layers.find(
    (layer) => flowOrder.indexOf(layer.kind) > flowOrder.indexOf(kind),
  );
  const last = layers.at(-1);
  const top = next ? next.top : last ? last.top + last.height : 0.5;
  return { kind, top, height: 0 };
}

export function flowConnectors(from: FlowLayer[], to: FlowLayer[]) {
  return flowOrder
    .filter((kind) => [...from, ...to].some((layer) => layer.kind === kind))
    .map((kind) => {
      const a =
        from.find((layer) => layer.kind === kind) ?? collapsedLayer(from, kind);
      const b =
        to.find((layer) => layer.kind === kind) ?? collapsedLayer(to, kind);
      const aBottom = a.top + a.height;
      const bBottom = b.top + b.height;
      return {
        kind,
        path: `M0 ${a.top} C0.5 ${a.top} 0.5 ${b.top} 1 ${b.top} L1 ${bBottom} C0.5 ${bBottom} 0.5 ${aBottom} 0 ${aBottom} Z`,
      };
    });
}
