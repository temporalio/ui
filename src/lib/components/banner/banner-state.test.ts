import { describe, expect } from 'vitest';
import {
  isTemporalVersionBanner,
  isUIVersionBanner,
  getLinkForTemporalVersion,
  getLinkForUIVersion,
} from './banner-state';
import type { ClusterInformation } from '$lib/types/global';

const clusterInformation: ClusterInformation = {
  supportedClients: {
    'temporal-cli': '\u003c2.0.0',
    'temporal-go': '\u003c2.0.0',
    'temporal-java': '\u003c2.0.0',
    'temporal-php': '\u003c2.0.0',
    'temporal-server': '\u003c2.0.0',
    'temporal-typescript': '\u003c2.0.0',
    'temporal-ui': '\u003c3.0.0',
  },
  serverVersion: '1.20.1',
  clusterId: 'f9c299e0-a75f-4306-bfd6-17022bdb56b5',
  versionInfo: {
    current: {
      version: '1.20.1',
      releaseTime: '2023-03-29T20:22:08Z',
      notes: '',
    },
    recommended: {
      version: '1.20.2',
      releaseTime: '2023-04-20T18:15:00Z',
      notes: '',
    },
    instructions: '',
    alerts: [
      {
        message: '🪐 A new release is available!',
        severity: 'Low',
      },
    ],
    lastUpdateTime: '2023-05-24T22:42:28.556129Z',
  },
  clusterName: 'active',
  historyShardCount: 1,
  persistenceStore: 'sqlite',
  visibilityStore: 'sqlite',
};

describe('isTemporalVersionBanner', (it) => {
  it('should return true if the state is TemporalVersion', () => {
    expect(isTemporalVersionBanner(1)).toBe(true);
  });

  it('should return false if the state is not TemporalVersion', () => {
    expect(isTemporalVersionBanner(2)).toBe(false);
  });
});

describe('isTemporalVersionBanner', (it) => {
  it('should return true if the state is UIVersion', () => {
    expect(isUIVersionBanner(2)).toBe(true);
  });

  it('should return false if the state is not UIVersion', () => {
    expect(isUIVersionBanner(1)).toBe(false);
  });
});

describe('getLinkForTemporalVersion', (it) => {
  it('should return a link for the Temporal version', () => {
    expect(getLinkForTemporalVersion(clusterInformation)).toBe(
      'https://github.com/temporalio/temporal/releases/tag/v1.20.2',
    );
  });
});

describe('getLinkForUIVersion', (it) => {
  it('should return a link for the UI version', () => {
    expect(
      getLinkForUIVersion({ recommended: '2.0.0', current: '1.9.9' }),
    ).toBe('https://github.com/temporalio/ui-server/releases/tag/v2.0.0');
  });
});
