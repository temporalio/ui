import { describe, expect, it } from 'vitest';

import { launchOutcomeExplanation } from './launch-outcome-presentation';
import type {
  RejectedLaunchOutcome,
  UncertainLaunchOutcome,
} from './workbench-host';

const rejected = (reason: RejectedLaunchOutcome['reason']) =>
  ({ status: 'rejected', reason }) as RejectedLaunchOutcome;

const uncertain = (reason: UncertainLaunchOutcome['reason']) =>
  ({ status: 'uncertain', reason }) as UncertainLaunchOutcome;

describe('launchOutcomeExplanation', () => {
  it('explains every rejection reason without leaking the raw code', () => {
    const explanations = (
      [
        'aborted',
        'conflict',
        'forbidden',
        'invalid-request',
        'not-found',
      ] as const
    ).map((reason) => launchOutcomeExplanation(rejected(reason)));

    for (const explanation of explanations) {
      expect(explanation).toBeTruthy();
      expect(explanation).not.toMatch(/[a-z]+-[a-z]+/);
    }
    expect(new Set(explanations).size).toBe(explanations.length);
  });

  it('names what the developer can do about each rejection', () => {
    expect(launchOutcomeExplanation(rejected('not-found'))).toContain(
      'does not support',
    );
    expect(launchOutcomeExplanation(rejected('forbidden'))).toContain(
      'permission',
    );
    expect(launchOutcomeExplanation(rejected('conflict'))).toContain('already');
    expect(launchOutcomeExplanation(rejected('invalid-request'))).toContain(
      'rejected the request',
    );
  });

  it('distinguishes uncertain outcomes, which may still be running', () => {
    for (const reason of [
      'aborted-after-dispatch',
      'transport-failure',
      'unusable-response',
    ] as const) {
      expect(launchOutcomeExplanation(uncertain(reason))).toMatch(
        /may have started|could not be confirmed/i,
      );
    }
  });

  it('returns nothing for an accepted outcome', () => {
    expect(
      launchOutcomeExplanation({ status: 'accepted' } as never),
    ).toBeUndefined();
    expect(launchOutcomeExplanation(undefined)).toBeUndefined();
  });
});
