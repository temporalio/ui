import { describe, expect, it } from 'vitest';

import { formatReason, getPlacholder } from './workflow-actions';
import { Action } from '../models/workflow-actions';

describe('getPlacholder', () => {
  describe('without an authorized user', () => {
    it('should return the correct placeholder', () => {
      expect(getPlacholder(Action.Cancel)).toEqual('Canceled from the Web UI');
      expect(getPlacholder(Action.Reset)).toEqual('Reset from the Web UI');
      expect(getPlacholder(Action.Terminate)).toEqual(
        'Terminated from the Web UI',
      );
    });
  });

  describe('with authorized user', () => {
    it('should return the correct placeholder', () => {
      expect(getPlacholder(Action.Cancel, 'test@temporal.io')).toEqual(
        'Canceled from the Web UI by test@temporal.io',
      );
      expect(getPlacholder(Action.Reset, 'test@temporal.io')).toEqual(
        'Reset from the Web UI by test@temporal.io',
      );
      expect(getPlacholder(Action.Terminate, 'test@temporal.io')).toEqual(
        'Terminated from the Web UI by test@temporal.io',
      );
    });
  });
});

describe('formatReason', () => {
  describe('without an authorized user', () => {
    it('should return the reason with the placeholder', () => {
      expect(
        formatReason({ action: Action.Cancel, reason: 'Testing' }),
      ).toEqual('Testing Canceled from the Web UI');
      expect(formatReason({ action: Action.Reset, reason: 'Testing' })).toEqual(
        'Testing Reset from the Web UI',
      );
      expect(
        formatReason({ action: Action.Terminate, reason: 'Testing' }),
      ).toEqual('Testing Terminated from the Web UI');
    });
  });

  it('should return the placeholder if there is no reason', () => {
    const reason = '';
    expect(formatReason({ action: Action.Cancel, reason })).toEqual(
      'Canceled from the Web UI',
    );
    expect(formatReason({ action: Action.Reset, reason })).toEqual(
      'Reset from the Web UI',
    );
    expect(formatReason({ action: Action.Terminate, reason })).toEqual(
      'Terminated from the Web UI',
    );
  });

  describe('with an authorized user', () => {
    it('should return the reason with the placeholder', () => {
      const reason = 'Testing';

      expect(
        formatReason({
          action: Action.Cancel,
          reason,
          email: 'test@temporal.io',
        }),
      ).toEqual('Testing Canceled from the Web UI by test@temporal.io');
      expect(
        formatReason({
          action: Action.Reset,
          reason,
          email: 'test@temporal.io',
        }),
      ).toEqual('Testing Reset from the Web UI by test@temporal.io');
      expect(
        formatReason({
          action: Action.Terminate,
          reason,
          email: 'test@temporal.io',
        }),
      ).toEqual('Testing Terminated from the Web UI by test@temporal.io');
    });

    it('should return the placeholder if there is no reason', () => {
      const reason = '';

      expect(
        formatReason({
          action: Action.Cancel,
          reason,
          email: 'test@temporal.io',
        }),
      ).toEqual('Canceled from the Web UI by test@temporal.io');
      expect(
        formatReason({
          action: Action.Reset,
          reason,
          email: 'test@temporal.io',
        }),
      ).toEqual('Reset from the Web UI by test@temporal.io');
      expect(
        formatReason({
          action: Action.Terminate,
          reason,
          email: 'test@temporal.io',
        }),
      ).toEqual('Terminated from the Web UI by test@temporal.io');
    });
  });
});
