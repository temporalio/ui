import { describe, expect, test } from 'vitest';

import type { ComputeConfig } from '$lib/types/deployments';

import {
  computeProviderLabel,
  computeProviderShortLabel,
  getScalingGroups,
  getUncoveredRegions,
  isMultiRegion,
  resolveRegionCoverage,
  shortRegion,
} from './compute-regions';

const EAST = 'aws-us-east-1';
const WEST = 'aws-us-west-2';

/** The Namespace's regions, with the first argument active unless said otherwise. */
const regions = (...ids: string[]) =>
  ids.map((regionId, i) => ({ regionId, active: i === 0 }));

const config = (
  groups: Record<string, { regionId?: string; providerType?: string }>,
): ComputeConfig => ({ scalingGroups: groups });

describe('isMultiRegion', () => {
  // The whole gate. A consumer that says nothing gets single region, which is
  // what every self-hosted install and every Namespace without HA should see.
  test.each([
    ['undefined', undefined, false],
    ['no regions', [], false],
    ['one region', regions(EAST), false],
    ['two regions', regions(EAST, WEST), true],
  ])('%s', (_name, regions, expected) => {
    expect(isMultiRegion(regions)).toBe(expected);
  });

  test('a regionId on a group does not make a single-region Namespace multi-region', () => {
    // The compute config deliberately gets no vote: two conditions that can
    // disagree is how a half-gated feature reaches someone who should not see it.
    expect(isMultiRegion(regions(EAST))).toBe(false);
  });
});

describe('shortRegion', () => {
  test('strips the cloud prefix', () => {
    expect(shortRegion(EAST)).toBe('us-east-1');
    expect(shortRegion('gcp-europe-west1')).toBe('europe-west1');
  });
});

describe('getScalingGroups', () => {
  test('keeps the group name and reads its region', () => {
    expect(getScalingGroups(config({ east: { regionId: EAST } }))).toEqual([
      {
        name: 'east',
        regionId: EAST,
        providerType: undefined,
        group: { regionId: EAST },
      },
    ]);
  });

  test('reads an empty regionId as unset, not as a region no Namespace has', () => {
    expect(
      getScalingGroups(config({ any: { regionId: '' } }))[0].regionId,
    ).toBeUndefined();
  });

  test('has no groups without a compute config', () => {
    expect(getScalingGroups(undefined)).toEqual([]);
  });
});

describe('resolveRegionCoverage', () => {
  test('a catch-all group covers every region', () => {
    const coverage = resolveRegionCoverage(
      config({ any: {} }),
      regions(EAST, WEST),
    );

    expect(coverage.map(({ match }) => match)).toEqual([
      'catch-all',
      'catch-all',
    ]);
    expect(coverage.map(({ groups }) => groups.map((g) => g.name))).toEqual([
      ['any'],
      ['any'],
    ]);
  });

  test('each region takes its own group', () => {
    const coverage = resolveRegionCoverage(
      config({ east: { regionId: EAST }, west: { regionId: WEST } }),
      regions(EAST, WEST),
    );

    expect(coverage.map(({ match }) => match)).toEqual(['region', 'region']);
    expect(coverage.map(({ groups }) => groups[0].name)).toEqual([
      'east',
      'west',
    ]);
  });

  test('an exact region wins over a catch-all', () => {
    const coverage = resolveRegionCoverage(
      config({ any: {}, east: { regionId: EAST } }),
      regions(EAST, WEST),
    );

    expect(coverage[0]).toMatchObject({ match: 'region' });
    expect(coverage[0].groups.map((g) => g.name)).toEqual(['east']);
    // The catch-all still serves the region that has nothing of its own.
    expect(coverage[1]).toMatchObject({ match: 'catch-all' });
  });

  test('the active region is primary and the rest are replicas', () => {
    const coverage = resolveRegionCoverage(
      config({ any: {} }),
      regions(EAST, WEST, 'aws-eu-west-1'),
    );

    expect(coverage.map(({ role }) => role)).toEqual([
      'primary',
      'replica',
      'replica',
    ]);
  });

  test('role follows the active flag, not the order regions arrive in', () => {
    // A caller that lists the active region second must still get it marked
    // primary; nothing here depends on a sort order the caller has to remember.
    const coverage = resolveRegionCoverage(config({ any: {} }), [
      { regionId: WEST },
      { regionId: EAST, active: true },
    ]);

    expect(coverage.map(({ regionId, role }) => [regionId, role])).toEqual([
      [WEST, 'replica'],
      [EAST, 'primary'],
    ]);
  });

  test('every group matching a region is returned, not just the first', () => {
    // A region can have more than one group, e.g. one per task queue type.
    const coverage = resolveRegionCoverage(
      config({ activities: { regionId: EAST }, workflows: { regionId: EAST } }),
      regions(EAST),
    );

    expect(coverage[0].groups.map((g) => g.name)).toEqual([
      'activities',
      'workflows',
    ]);
  });

  test('a region with neither a match nor a catch-all is uncovered', () => {
    const coverage = resolveRegionCoverage(
      config({ west: { regionId: WEST } }),
      regions(EAST, WEST),
    );

    expect(coverage[0]).toMatchObject({
      regionId: EAST,
      match: 'none',
      groups: [],
    });
  });
});

describe('getUncoveredRegions', () => {
  test('names the regions that would fail over to no workers', () => {
    expect(
      getUncoveredRegions(
        config({ west: { regionId: WEST } }),
        regions(EAST, WEST),
      ),
    ).toEqual([EAST]);
  });

  test('is empty when a catch-all covers everything', () => {
    expect(
      getUncoveredRegions(config({ any: {} }), regions(EAST, WEST)),
    ).toEqual([]);
  });
});

describe('provider labels', () => {
  // Read from the registry rather than restated here, so adding a provider does
  // not mean remembering these two functions exist.
  test.each([
    ['aws-lambda', 'AWS Lambda', 'Lambda'],
    ['gcp-cloud-run', 'Google Cloud Run', 'Cloud Run'],
  ])('%s', (type, long, short) => {
    expect(computeProviderLabel(type)).toBe(long);
    expect(computeProviderShortLabel(type)).toBe(short);
  });

  test('an unknown provider shows its raw type rather than an empty cell', () => {
    expect(computeProviderLabel('azure-functions')).toBe('azure-functions');
    expect(computeProviderShortLabel('azure-functions')).toBe(
      'azure-functions',
    );
  });

  test('undefined stays undefined', () => {
    expect(computeProviderLabel(undefined)).toBeUndefined();
  });
});
