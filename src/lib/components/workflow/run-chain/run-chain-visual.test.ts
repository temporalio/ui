import { describe, expect, it } from 'vitest';

import {
  dotColors,
  getCategoryStrokeColor,
  getStatusStrokeColor,
} from '$lib/components/lines-and-dots/colors';

import type { ChainStep } from './run-chain';
import {
  chainRunColor,
  chainStepVisual,
  flowConnectors,
  flowLayers,
  flowThickness,
} from './run-chain-visual';

const step: ChainStep = {
  id: '1',
  name: 'charge',
  kind: 'activity',
  status: 'Completed',
  startTime: 0,
  closeTime: 1000,
  lane: 0,
};

describe('chain visuals share Timeline semantics', () => {
  it.each([
    ['Completed', 'Completed'],
    ['Failed', 'Failed'],
    ['Timed out', 'TimedOut'],
    ['Canceled', 'Canceled'],
    ['Terminated', 'Terminated'],
  ] as const)('uses Timeline colors for %s', (status, classification) => {
    const visual = chainStepVisual({ ...step, status });
    expect(visual.classification).toBe(classification);
    expect(visual.dot).toEqual(dotColors(classification));
    expect(visual.line).toBe(getStatusStrokeColor(classification));
  });

  it('shows a completed timer as Fired, not a completed activity', () => {
    const visual = chainStepVisual({ ...step, kind: 'timer' });
    expect(visual.classification).toBe('Fired');
    expect(visual.dot).toEqual(dotColors('Fired'));
    expect(visual.line).toBe(getStatusStrokeColor('Fired'));
  });

  it('distinguishes pending work, retries, and completion after retries', () => {
    const pending = { ...step, status: 'Scheduled', closeTime: undefined };
    expect(chainStepVisual(pending).line).toBe(
      getCategoryStrokeColor('pending'),
    );
    expect(chainStepVisual({ ...pending, attempts: 3 }).line).toBe(
      getCategoryStrokeColor('retry'),
    );
    const recovered = chainStepVisual({ ...step, attempts: 4 });
    expect(recovered.dot).toEqual(dotColors('Completed'));
    expect(recovered.background).toContain(getStatusStrokeColor('Completed'));
    expect(recovered.background).toContain(dotColors('Failed').fill);
  });

  it('keeps timeout and cancellation colors when a run interrupts a step', () => {
    expect(
      chainStepVisual({
        ...step,
        status: 'Interrupted',
        interruptedBy: 'Timed out',
      }).classification,
    ).toBe('TimedOut');
    expect(
      chainStepVisual({
        ...step,
        status: 'Interrupted',
        interruptedBy: 'Canceled',
      }).classification,
    ).toBe('Canceled');
    expect(chainRunColor('Timed out')).toBe(getStatusStrokeColor('TimedOut'));
  });
});

describe('chain flow ribbon', () => {
  const counts = (total: number) => ({ total });

  it('scales thickness with work and keeps a visible minimum', () => {
    expect(flowThickness(0, 40)).toBe(0);
    expect(flowThickness(40, 40)).toBe(1);
    expect(flowThickness(1, 1000)).toBeCloseTo(0.35065);
  });

  it('stacks layers in a stable order with a minimum share each', () => {
    const layers = flowLayers(
      [
        { kind: 'timer', counts: counts(1) },
        { kind: 'activity', counts: counts(3) },
        { kind: 'signal', counts: counts(0) },
      ],
      0.4,
    );
    expect(layers.map((layer) => layer.kind)).toEqual(['activity', 'timer']);
    expect(layers[0].top).toBeCloseTo(0.3);
    expect(layers[0].height).toBeCloseTo(0.276);
    expect(layers[1].top).toBeCloseTo(0.576);
    expect(layers[1].top + layers[1].height).toBeCloseTo(0.7);
  });

  it('tapers layers that only exist on one side of a connector', () => {
    const from = flowLayers([{ kind: 'activity', counts: counts(2) }], 0.4);
    const to = flowLayers(
      [
        { kind: 'activity', counts: counts(1) },
        { kind: 'timer', counts: counts(1) },
      ],
      0.6,
    );
    const connectors = flowConnectors(from, to);
    expect(connectors.map((connector) => connector.kind)).toEqual([
      'activity',
      'timer',
    ]);
    expect(connectors[1].path).toBe(
      'M0 0.7 C0.5 0.7 0.5 0.5 1 0.5 L1 0.8 C0.5 0.8 0.5 0.7 0 0.7 Z',
    );
    expect(flowConnectors([], [])).toEqual([]);
  });
});
