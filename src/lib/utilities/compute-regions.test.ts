import { describe, expect, test } from 'vitest';

import type { ComputeConfig } from '$lib/types/deployments';

import {
  formatDurationMs,
  getScalingGroups,
  getUncoveredRegions,
  isMultiRegionConfig,
  resolveRegionCoverage,
  shortRegion,
} from './compute-regions';

const EAST = 'aws-us-east-1';
const WEST = 'aws-us-west-2';
const REGIONS = [EAST, WEST];

const legacy: ComputeConfig = {
  scalingGroups: { default: { providerType: 'aws-lambda' } },
};

const perRegion: ComputeConfig = {
  scalingGroups: {
    myEastWorkers: { regionId: EAST, providerType: 'aws-lambda' },
    myWestWorkers: { regionId: WEST, providerType: 'aws-lambda' },
  },
};

const upgraded: ComputeConfig = {
  scalingGroups: {
    default: { providerType: 'aws-lambda' },
    secondary: { regionId: WEST, providerType: 'aws-lambda' },
  },
};

const secondaryOnly: ComputeConfig = {
  scalingGroups: {
    'serverless-failover': { regionId: WEST, providerType: 'aws-lambda' },
  },
};

const matches = (config: ComputeConfig) =>
  resolveRegionCoverage(config, REGIONS).map(({ regionId, match, groups }) => [
    regionId,
    match,
    groups.map(({ name }) => name),
  ]);

describe('shortRegion', () => {
  test('strips the cloud prefix', () => {
    expect(shortRegion(EAST)).toBe('us-east-1');
    expect(shortRegion('gcp-us-central1')).toBe('us-central1');
  });
});

describe('getScalingGroups', () => {
  test('keeps group names and reads regionId from the group', () => {
    expect(getScalingGroups(perRegion)).toMatchObject([
      { name: 'myEastWorkers', regionId: EAST, providerType: 'aws-lambda' },
      { name: 'myWestWorkers', regionId: WEST, providerType: 'aws-lambda' },
    ]);
  });

  test('treats an empty regionId as unset', () => {
    expect(
      getScalingGroups({ scalingGroups: { a: { regionId: '' } } })[0].regionId,
    ).toBeUndefined();
  });

  test('returns an empty list without a compute config', () => {
    expect(getScalingGroups(undefined)).toEqual([]);
  });
});

describe('isMultiRegionConfig', () => {
  test('is false when no group has a regionId', () => {
    expect(isMultiRegionConfig(legacy)).toBe(false);
  });

  test('is true once any group has a regionId', () => {
    expect(isMultiRegionConfig(secondaryOnly)).toBe(true);
  });
});

describe('resolveRegionCoverage', () => {
  test('a legacy catch-all group covers every region', () => {
    expect(matches(legacy)).toEqual([
      [EAST, 'catch-all', ['default']],
      [WEST, 'catch-all', ['default']],
    ]);
  });

  test('matches each region to its own group', () => {
    expect(matches(perRegion)).toEqual([
      [EAST, 'region', ['myEastWorkers']],
      [WEST, 'region', ['myWestWorkers']],
    ]);
  });

  test('an exact regionId match wins over the catch-all', () => {
    expect(matches(upgraded)).toEqual([
      [EAST, 'catch-all', ['default']],
      [WEST, 'region', ['secondary']],
    ]);
  });

  test('a secondary-only config leaves the primary uncovered', () => {
    expect(matches(secondaryOnly)).toEqual([
      [EAST, 'none', []],
      [WEST, 'region', ['serverless-failover']],
    ]);
  });

  test('marks the first Namespace region primary', () => {
    expect(
      resolveRegionCoverage(perRegion, REGIONS).map(({ role }) => role),
    ).toEqual(['primary', 'replica']);
  });

  test('returns every group matching a region, e.g. per task queue type', () => {
    const config: ComputeConfig = {
      scalingGroups: {
        eastWorkflows: { regionId: EAST, taskQueueTypes: ['Workflows'] },
        eastActivities: { regionId: EAST, taskQueueTypes: ['Activities'] },
      },
    };
    expect(matches(config)[0]).toEqual([
      EAST,
      'region',
      ['eastWorkflows', 'eastActivities'],
    ]);
  });
});

describe('getUncoveredRegions', () => {
  test('lists regions with neither a match nor a catch-all', () => {
    expect(getUncoveredRegions(secondaryOnly, REGIONS)).toEqual([EAST]);
    expect(getUncoveredRegions(upgraded, REGIONS)).toEqual([]);
  });
});

describe('formatDurationMs', () => {
  test('uses the largest whole unit', () => {
    expect(formatDurationMs(900_000)).toBe('15m');
    expect(formatDurationMs(5_000)).toBe('5s');
    expect(formatDurationMs(7_200_000)).toBe('2h');
  });

  test('falls back to ms when no unit divides evenly', () => {
    expect(formatDurationMs(1_500)).toBe('1500ms');
    expect(formatDurationMs(250)).toBe('250ms');
  });
});
