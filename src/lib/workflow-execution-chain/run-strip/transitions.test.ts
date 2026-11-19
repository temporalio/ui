import { describe, expect, it } from 'vitest';

import type { HistoryEvent } from '$lib/types/events';

import { transitionOf } from './transitions';

const runWith = (
  attributes: Record<string, unknown>,
  runId = 'run-2',
): { runId: string; startedEvent: HistoryEvent } => ({
  runId,
  startedEvent: {
    workflowExecutionStartedEventAttributes: attributes,
  } as unknown as HistoryEvent,
});

const runWithInitiator = (
  initiator: unknown,
  continuedExecutionRunId = 'run-1',
) => runWith({ initiator, continuedExecutionRunId });

describe('transitionOf', () => {
  it.each([
    ['CONTINUE_AS_NEW_INITIATOR_WORKFLOW', 'continuedAsNew'],
    ['CONTINUE_AS_NEW_INITIATOR_RETRY', 'retry'],
    ['CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE', 'cron'],
    ['Workflow', 'continuedAsNew'],
    ['Retry', 'retry'],
    ['CronSchedule', 'cron'],
  ])('reads %s as %s', (initiator, transition) => {
    expect(transitionOf(runWithInitiator(initiator))).toBe(transition);
  });

  it.each([undefined, 'CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED', 2])(
    'falls back to continue-as-new for %s',
    (initiator) => {
      expect(transitionOf(runWithInitiator(initiator))).toBe('continuedAsNew');
    },
  );

  it('is null for the first Run in the chain', () => {
    expect(
      transitionOf(runWithInitiator('CONTINUE_AS_NEW_INITIATOR_RETRY', '')),
    ).toBe(null);
    expect(transitionOf(runWith({}))).toBe(null);
  });

  it('is null when the original Run ID is the Run itself', () => {
    expect(
      transitionOf(runWith({ originalExecutionRunId: 'run-2' }, 'run-2')),
    ).toBe(null);
  });

  it('reads a Run started by a reset as reset, even with a continue-as-new initiator', () => {
    expect(
      transitionOf(
        runWith(
          {
            initiator: 'CONTINUE_AS_NEW_INITIATOR_WORKFLOW',
            continuedExecutionRunId: 'run-1',
            originalExecutionRunId: 'run-2',
          },
          'run-3',
        ),
      ),
    ).toBe('reset');
    expect(
      transitionOf(runWith({ originalExecutionRunId: 'run-1' }, 'run-2')),
    ).toBe('reset');
  });
});
