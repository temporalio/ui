import { describe, expect, it } from 'vitest';

import { formatReason, getPlaceholder } from './workflow-actions';
import { Action } from '../models/workflow-actions';

function getIdentity(withUser: boolean = false): string | undefined {
  return withUser ? 'test@temporal.io' : undefined;
}

describe('getPlaceholder', () => {
  describe('without an authorized user', () => {
    const identity = getIdentity();
    it('should return the correct placeholder', () => {
      expect(getPlaceholder(Action.Cancel, identity)).toEqual(
        'Canceled by Unknown',
      );
      expect(getPlaceholder(Action.Reset, identity)).toEqual(
        'Reset by Unknown',
      );
      expect(getPlaceholder(Action.Terminate, identity)).toEqual(
        'Terminated by Unknown',
      );
    });
  });

  describe('with authorized user', () => {
    const identity = getIdentity(true);
    it('should return the correct placeholder', () => {
      expect(getPlaceholder(Action.Cancel, identity)).toEqual(
        'Canceled by test@temporal.io',
      );
      expect(getPlaceholder(Action.Reset, identity)).toEqual(
        'Reset by test@temporal.io',
      );
      expect(getPlaceholder(Action.Terminate, identity)).toEqual(
        'Terminated by test@temporal.io',
      );
    });
  });
});

describe('formatReason', () => {
  const identity = getIdentity();
  describe('without an authorized user', () => {
    it('should return the reason with the placeholder', () => {
      expect(
        formatReason({ action: Action.Cancel, reason: 'Testing', identity }),
      ).toEqual('Testing Canceled by Unknown');
      expect(
        formatReason({ action: Action.Reset, reason: 'Testing', identity }),
      ).toEqual('Testing Reset by Unknown');
      expect(
        formatReason({ action: Action.Terminate, reason: 'Testing', identity }),
      ).toEqual('Testing Terminated by Unknown');
      expect(
        formatReason({ action: Action.Pause, reason: 'Testing', identity }),
      ).toEqual('Testing Paused by Unknown');
      expect(
        formatReason({ action: Action.Unpause, reason: 'Testing', identity }),
      ).toEqual('Testing Unpaused by Unknown');
    });
  });

  it('should return the placeholder if there is no reason', () => {
    const reason = '';
    expect(formatReason({ action: Action.Cancel, reason, identity })).toEqual(
      'Canceled by Unknown',
    );
    expect(formatReason({ action: Action.Reset, reason, identity })).toEqual(
      'Reset by Unknown',
    );
    expect(
      formatReason({ action: Action.Terminate, reason, identity }),
    ).toEqual('Terminated by Unknown');
    expect(formatReason({ action: Action.Pause, reason, identity })).toEqual(
      'Paused by Unknown',
    );
    expect(formatReason({ action: Action.Unpause, reason, identity })).toEqual(
      'Unpaused by Unknown',
    );
  });

  describe('with an authorized user', () => {
    const identity = getIdentity(true);
    it('should return the reason with the placeholder', () => {
      const reason = 'Testing';

      expect(
        formatReason({
          action: Action.Cancel,
          reason,
          identity,
        }),
      ).toEqual('Testing Canceled by test@temporal.io');
      expect(
        formatReason({
          action: Action.Reset,
          reason,
          identity,
        }),
      ).toEqual('Testing Reset by test@temporal.io');
      expect(
        formatReason({
          action: Action.Terminate,
          reason,
          identity,
        }),
      ).toEqual('Testing Terminated by test@temporal.io');
      expect(
        formatReason({
          action: Action.Pause,
          reason,
          identity,
        }),
      ).toEqual('Testing Paused by test@temporal.io');
      expect(
        formatReason({
          action: Action.Unpause,
          reason,
          identity,
        }),
      ).toEqual('Testing Unpaused by test@temporal.io');
    });

    it('should return the placeholder if there is no reason', () => {
      const reason = '';

      expect(
        formatReason({
          action: Action.Cancel,
          reason,
          identity,
        }),
      ).toEqual('Canceled by test@temporal.io');
      expect(
        formatReason({
          action: Action.Reset,
          reason,
          identity,
        }),
      ).toEqual('Reset by test@temporal.io');
      expect(
        formatReason({
          action: Action.Terminate,
          reason,
          identity,
        }),
      ).toEqual('Terminated by test@temporal.io');
      expect(
        formatReason({
          action: Action.Pause,
          reason,
          identity,
        }),
      ).toEqual('Paused by test@temporal.io');
      expect(
        formatReason({
          action: Action.Unpause,
          reason,
          identity,
        }),
      ).toEqual('Unpaused by test@temporal.io');
    });
  });
});
