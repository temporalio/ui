import { describe, expect, it } from 'vitest';

import {
  dotColors,
  getCategoryStrokeColor,
  getStatusStrokeColor,
} from '$lib/components/lines-and-dots/colors';

import type { ChainStep } from './run-chain';
import { chainRunColor, chainStepVisual } from './run-chain-visual';

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
