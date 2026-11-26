import { describe, expect, it } from 'vitest';

import { getPlaceholder } from './workflow-actions';
import { Action } from '../models/workflow-actions';

function getIdentity(withUser: boolean = false): string | undefined {
  return withUser ? 'test@temporal.io' : undefined;
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
