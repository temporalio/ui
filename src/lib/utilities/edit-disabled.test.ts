import { describe, expect, test } from 'vitest';

import { editDisabled } from './edit-disabled';

describe('editDisabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
  };

  test('returns false when write actions and namespace write actions are enabled', () => {
    expect(
      editDisabled(
        { disableWriteActions: false },
        coreUser,
        'ns-write-enabled',
      ),
    ).toBe(false);
  });

  describe('returns true', () => {
    test('when write actions are disabled', () => {
      expect(
        editDisabled(
          { disableWriteActions: true },
          coreUser,
          'ns-write-enabled',
        ),
      ).toBe(true);
    });

    test('when namespace write actions are disabled', () => {
      expect(
        editDisabled(
          { disableWriteActions: false },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(true);
    });

    test('when both write actions and namespace write actions are disabled', () => {
      expect(
        editDisabled(
          { disableWriteActions: true },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(true);
    });
  });
});
