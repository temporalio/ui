import { describe, expect, it } from 'vitest';

import type { HistoryEvent } from '$lib/types/events';

import { transitionOf } from './transitions';

const startedBy = (initiator: unknown, continuedExecutionRunId = 'run-1') =>
  ({
    workflowExecutionStartedEventAttributes: {
      initiator,
      continuedExecutionRunId,
    },
  }) as unknown as HistoryEvent;

describe('transitionOf', () => {
  it.each([
    ['CONTINUE_AS_NEW_INITIATOR_WORKFLOW', 'continuedAsNew'],
    ['CONTINUE_AS_NEW_INITIATOR_RETRY', 'retry'],
    ['CONTINUE_AS_NEW_INITIATOR_CRON_SCHEDULE', 'cron'],
    ['Workflow', 'continuedAsNew'],
    ['Retry', 'retry'],
    ['CronSchedule', 'cron'],
  ])('reads %s as %s', (initiator, transition) => {
    expect(transitionOf(startedBy(initiator))).toBe(transition);
  });

  it.each([undefined, 'CONTINUE_AS_NEW_INITIATOR_UNSPECIFIED', 2])(
    'falls back to continue-as-new for %s',
    (initiator) => {
      expect(transitionOf(startedBy(initiator))).toBe('continuedAsNew');
    },
  );

  it('is null for the first Run in the chain', () => {
    expect(transitionOf(startedBy('CONTINUE_AS_NEW_INITIATOR_RETRY', ''))).toBe(
      null,
    );
    expect(transitionOf({} as HistoryEvent)).toBe(null);
  });
});
