import { describe, expect, it } from 'vitest';

import {
  getInstalledVersions,
  getUpgradeNotice,
  toUpgradeDistribution,
} from './upgrade-notice';

describe('getUpgradeNotice', () => {
  it('recommends a newer CLI release', () => {
    expect(
      getUpgradeNotice({
        distribution: 'cli',
        installed: { cli: '1.4.1', server: '1.28.0' },
        latest: { cli: '1.9.1' },
      }),
    ).toEqual({
      distribution: 'cli',
      current: '1.4.1',
      latest: '1.9.1',
      href: 'https://docs.temporal.io/cli#install',
    });
  });

  it('ignores releases of other components', () => {
    expect(
      getUpgradeNotice({
        distribution: 'cli',
        installed: { cli: '1.9.1', ui: '2.39.0', server: '1.28.0' },
        latest: { cli: '1.9.1', ui: '2.54.1', server: '1.32.0' },
      }),
    ).toBeNull();
  });

  it('checks the UI image for docker', () => {
    expect(
      getUpgradeNotice({
        distribution: 'docker',
        installed: { ui: '2.39.0', server: '1.28.0' },
        latest: { ui: '2.54.1' },
      }),
    ).toEqual({
      distribution: 'docker',
      current: '2.39.0',
      latest: '2.54.1',
      href: 'https://hub.docker.com/r/temporalio/ui',
    });
  });

  it('checks only the chart for helm', () => {
    expect(
      getUpgradeNotice({
        distribution: 'helm',
        installed: { helm: '1.7.0', ui: '2.39.0', server: '1.28.0' },
        latest: { helm: '1.7.0', ui: '2.54.1', server: '1.32.0' },
      }),
    ).toBeNull();
    expect(
      getUpgradeNotice({
        distribution: 'helm',
        installed: { helm: '1.5.0' },
        latest: { helm: '1.7.0' },
      })?.latest,
    ).toBe('1.7.0');
  });

  it('links source builds to the server releases', () => {
    expect(
      getUpgradeNotice({
        distribution: 'server',
        installed: { server: '1.28.0' },
        latest: { server: '1.32.0' },
      })?.href,
    ).toBe('https://github.com/temporalio/temporal/releases');
  });

  it('returns null without a latest release', () => {
    expect(
      getUpgradeNotice({
        distribution: 'cli',
        installed: { cli: '1.4.1' },
        latest: {},
      }),
    ).toBeNull();
  });
});

describe('getInstalledVersions', () => {
  it('uses the distribution version only for its own distribution', () => {
    expect(
      getInstalledVersions({
        distribution: 'cli',
        distributionVersion: '1.4.1',
        uiVersion: '2.39.0',
        serverVersion: '1.28.0',
      }),
    ).toEqual({
      cli: '1.4.1',
      helm: undefined,
      ui: '2.39.0',
      server: '1.28.0',
    });
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
