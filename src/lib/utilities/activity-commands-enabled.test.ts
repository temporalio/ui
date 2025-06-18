import { describe, expect, test } from 'vitest';

import { activityCommandsEnabled } from './activity-commands-enabled';

describe('activityCommandsEnabled', () => {
  const coreUser = {
    namespaceWriteDisabled: (ns: string) => ns === 'ns-write-disabled',
    isActivityCommandsDisabled: false,
  };

  test('returns true when global write actions, namespace write actions, and the feature flag is not enabled', () => {
    expect(
      activityCommandsEnabled(
        {
          disableWriteActions: false,
        },
        coreUser,
        'ns-activity-commands',
      ),
    ).toBe(true);
  });

  describe('returns false', () => {
    test('when write actions are disabled', () => {
      expect(
        activityCommandsEnabled(
          {
            disableWriteActions: true,
          },
          coreUser,
          'ns-activity-commands',
        ),
      ).toBe(false);
    });

    test('when the feature flag is enabled', () => {
      expect(
        activityCommandsEnabled(
          {
            disableWriteActions: false,
          },
          { ...coreUser, isActivityCommandsDisabled: true },
          'ns-activity-commands',
        ),
      ).toBe(false);
    });

    test('when write actions are disabled and the feature flag is enabled', () => {
      expect(
        activityCommandsEnabled(
          {
            disableWriteActions: true,
          },
          { ...coreUser, isActivityCommandsDisabled: true },
          'ns-activity-commands',
        ),
      ).toBe(false);
    });

    test('when namespace write actions are disabled', () => {
      expect(
        activityCommandsEnabled(
          {
            disableWriteActions: false,
          },
          coreUser,
          'ns-write-disabled',
        ),
      ).toBe(false);
    });
  });
});
