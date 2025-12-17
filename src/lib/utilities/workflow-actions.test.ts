import { describe, expect, it } from 'vitest';

import { formatIdentity } from './core-context';
import { formatReason, getPlaceholder } from './workflow-actions';
import { Action } from '../models/workflow-actions';

function getIdentity(withUser: boolean = false): string {
  return withUser ? formatIdentity('test@temporal.io') : formatIdentity();
}

describe('getPlaceholder', () => {
  describe('without an authorized user', () => {
    const identity = getIdentity();
    it('should return the correct placeholder', () => {
      expect(getPlaceholder(Action.Cancel, identity)).toEqual(
        'Canceled by webui',
      );
      expect(getPlaceholder(Action.Reset, identity)).toEqual('Reset by webui');
      expect(getPlaceholder(Action.Terminate, identity)).toEqual(
        'Terminated by webui',
      );
    });
  });

  describe('with authorized user', () => {
    const identity = getIdentity(true);
    it('should return the correct placeholder', () => {
      expect(getPlaceholder(Action.Cancel, identity)).toEqual(
        'Canceled by test@temporal.io - webui',
      );
      expect(getPlaceholder(Action.Reset, identity)).toEqual(
        'Reset by test@temporal.io - webui',
      );
      expect(getPlaceholder(Action.Terminate, identity)).toEqual(
        'Terminated by test@temporal.io - webui',
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
      ).toEqual('Testing Canceled by webui');
      expect(
        formatReason({ action: Action.Reset, reason: 'Testing', identity }),
      ).toEqual('Testing Reset by webui');
      expect(
        formatReason({ action: Action.Terminate, reason: 'Testing', identity }),
      ).toEqual('Testing Terminated by webui');
    });
  });

  it('should return the placeholder if there is no reason', () => {
    const reason = '';
    expect(formatReason({ action: Action.Cancel, reason, identity })).toEqual(
      'Canceled by webui',
    );
    expect(formatReason({ action: Action.Reset, reason, identity })).toEqual(
      'Reset by webui',
    );
    expect(
      formatReason({ action: Action.Terminate, reason, identity }),
    ).toEqual('Terminated by webui');
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
      ).toEqual('Testing Canceled by test@temporal.io - webui');
      expect(
        formatReason({
          action: Action.Reset,
          reason,
          identity,
        }),
      ).toEqual('Testing Reset by test@temporal.io - webui');
      expect(
        formatReason({
          action: Action.Terminate,
          reason,
          identity,
        }),
      ).toEqual('Testing Terminated by test@temporal.io - webui');
    });

    it('should return the placeholder if there is no reason', () => {
      const reason = '';

      expect(
        formatReason({
          action: Action.Cancel,
          reason,
          identity,
        }),
      ).toEqual('Canceled by test@temporal.io - webui');
      expect(
        formatReason({
          action: Action.Reset,
          reason,
          identity,
        }),
      ).toEqual('Reset by test@temporal.io - webui');
      expect(
        formatReason({
          action: Action.Terminate,
          reason,
          identity,
        }),
      ).toEqual('Terminated by test@temporal.io - webui');
    });
  });
});
