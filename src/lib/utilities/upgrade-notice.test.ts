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
        installed: { cli: '1.4.1', ui: '2.39.0' },
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
        installed: { cli: '1.9.1', image: '2.39.0', ui: '2.39.0' },
        latest: { cli: '1.9.1', image: '2.54.1', ui: '2.54.1' },
      }),
    ).toBeNull();
  });

  it('checks the published image for docker', () => {
    expect(
      getUpgradeNotice({
        distribution: 'docker',
        installed: { image: '2.39.0' },
        latest: { image: '2.54.1' },
      }),
    ).toEqual({
      distribution: 'docker',
      current: '2.39.0',
      latest: '2.54.1',
      href: 'https://hub.docker.com/r/temporalio/ui',
    });
  });

  it('checks the same image for helm, since the chart installs it', () => {
    expect(
      getUpgradeNotice({
        distribution: 'helm',
        installed: { image: '2.39.0' },
        latest: { image: '2.54.1' },
      }),
    ).toEqual({
      distribution: 'helm',
      current: '2.39.0',
      latest: '2.54.1',
      href: 'https://github.com/temporalio/helm-charts',
    });
  });

  it('checks the UI release for source builds', () => {
    expect(
      getUpgradeNotice({
        distribution: 'server',
        installed: { ui: '2.39.0' },
        latest: { ui: '2.54.1' },
      }),
    ).toEqual({
      distribution: 'server',
      current: '2.39.0',
      latest: '2.54.1',
      href: 'https://github.com/temporalio/ui/releases',
    });
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
      }),
    ).toEqual({
      cli: '1.4.1',
      image: '2.39.0',
      ui: '2.39.0',
    });
  });

  it('ignores a dev build version, which has no release to compare against', () => {
    expect(
      getInstalledVersions({
        distribution: 'cli',
        distributionVersion: '0.0.0-DEV',
        uiVersion: '2.39.0',
      }).cli,
    ).toBeUndefined();
  });

  it('leaves the CLI version unset for other distributions', () => {
    expect(
      getInstalledVersions({
        distribution: 'helm',
        distributionVersion: '1.7.0',
        uiVersion: '2.39.0',
      }),
    ).toEqual({
      cli: undefined,
      image: '2.39.0',
      ui: '2.39.0',
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
