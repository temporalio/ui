import { describe, expect, it } from 'vitest';

import { getUpgradeNotice, toUpgradeDistribution } from './upgrade-notice';

const cluster = (current: string, recommended: string) => ({
  serverVersion: current,
  versionInfo: {
    current: { version: current },
    recommended: { version: recommended },
  },
});

describe('getUpgradeNotice', () => {
  it('returns a notice when the recommended version is newer', () => {
    expect(
      getUpgradeNotice({
        cluster: cluster('1.20.1', '1.21.0'),
        notifyOnNewVersion: true,
        distribution: 'docker',
      }),
    ).toEqual({
      distribution: 'docker',
      current: '1.20.1',
      latest: '1.21.0',
      href: 'https://github.com/temporalio/docker-compose',
    });
  });

  it('returns null when notifications are off', () => {
    expect(
      getUpgradeNotice({
        cluster: cluster('1.20.1', '1.21.0'),
        notifyOnNewVersion: false,
      }),
    ).toBeNull();
  });

  it('returns null when the server is up to date', () => {
    expect(
      getUpgradeNotice({
        cluster: cluster('1.21.0', '1.21.0'),
        notifyOnNewVersion: true,
      }),
    ).toBeNull();
  });

  it('returns null without version info', () => {
    expect(
      getUpgradeNotice({
        cluster: { serverVersion: '1.20.1' },
        notifyOnNewVersion: true,
      }),
    ).toBeNull();
  });

  it('falls back to the server version when current is missing', () => {
    expect(
      getUpgradeNotice({
        cluster: {
          serverVersion: '1.20.1',
          versionInfo: { recommended: { version: '1.21.0' } },
        },
        notifyOnNewVersion: true,
      })?.current,
    ).toBe('1.20.1');
  });
});

describe('toUpgradeDistribution', () => {
  it('keeps a known distribution', () => {
    expect(toUpgradeDistribution('helm')).toBe('helm');
  });

  it('falls back to server for unknown or missing values', () => {
    expect(toUpgradeDistribution('nix')).toBe('server');
    expect(toUpgradeDistribution(undefined)).toBe('server');
  });
});
