import { describe, expect, it } from 'vitest';

import type {
  ComputeConfigScalingGroup,
  WorkerDeploymentVersionInfo,
} from '$lib/types/deployments';

import type { NamespaceRegion } from './compute-regions';
import {
  durationToMs,
  fieldsDifferingFromPrimary,
  lifecycleRows,
  metadataValue,
  regionBlocks,
  versionDetailsHref,
} from './version-details';

const lambdaGroup = (
  arn: string,
  {
    role = 'arn:aws:iam::123456789012:role/temporal-invoke',
    cooloffMs = 30000,
    regionIds,
  }: { role?: string; cooloffMs?: number; regionIds?: string[] } = {},
): ComputeConfigScalingGroup => ({
  ...(regionIds ? { regionIds } : {}),
  provider: {
    type: 'aws-lambda',
    details: { data: btoa(JSON.stringify({ arn, role })) },
  },
  scaler: {
    details: { data: btoa(JSON.stringify({ scale_up_cooloff_ms: cooloffMs })) },
  },
});

const EAST = 'arn:aws:lambda:us-east-1:123456789012:function:orders-worker:17';
const WEST = 'arn:aws:lambda:us-west-2:123456789012:function:orders-worker:17';

const HA_REGIONS: NamespaceRegion[] = [
  { regionId: 'aws-us-east-1', label: 'us-east-1', role: 'primary' },
  { regionId: 'aws-us-west-2', label: 'us-west-2', role: 'replica' },
];

const info = (
  fields: Partial<WorkerDeploymentVersionInfo>,
): WorkerDeploymentVersionInfo => ({
  version: 'orders.3.0.0',
  deploymentName: 'orders',
  createTime: '2026-10-01T09:12:00Z',
  ...fields,
});

describe('versionDetailsHref', () => {
  it('opens the drawer and keeps other query parameters', () => {
    const url = new URL('https://x.test/ns/deployments/orders?page=2');
    expect(versionDetailsHref(url, '3.0.0')).toBe(
      '/ns/deployments/orders?page=2&version=3.0.0',
    );
  });

  it('closes the drawer without a Build ID', () => {
    const url = new URL('https://x.test/ns/deployments/orders?version=3.0.0');
    expect(versionDetailsHref(url)).toBe('/ns/deployments/orders');
  });
});

describe('lifecycleRows', () => {
  it('shows how long a current Version has been live', () => {
    const { shown } = lifecycleRows(
      info({
        currentSinceTime: '2026-10-08T14:02:00Z',
        firstActivationTime: '2026-10-01T09:15:00Z',
      }),
      'Current',
    );
    expect(shown.map(({ key }) => key)).toEqual([
      'current-since',
      'first-activated',
      'created',
    ]);
  });

  it('shows the drainage check for a draining Version', () => {
    const { shown } = lifecycleRows(
      info({
        drainageInfo: {
          status: 'VERSION_DRAINAGE_STATUS_DRAINING',
          lastCheckedTime: '2026-10-12T10:00:00Z',
        },
        lastDeactivationTime: '2026-10-11T10:00:00Z',
      }),
      'Draining',
    );
    expect(shown[0]).toMatchObject({
      key: 'drainage',
      text: 'Draining',
      time: '2026-10-12T10:00:00Z',
    });
    expect(shown.map(({ key }) => key)).toContain('last-deactivated');
  });

  it('says a created Version never activated', () => {
    const { shown } = lifecycleRows(info({}), 'Created');
    expect(shown[1]).toMatchObject({
      key: 'first-activated',
      text: 'Never activated',
    });
  });

  it('lists only the timestamps the status rows leave out', () => {
    const { all } = lifecycleRows(
      info({
        currentSinceTime: '2026-10-08T14:02:00Z',
        routingChangedTime: '2026-10-08T14:02:00Z',
      }),
      'Current',
    );
    expect(all.map(({ key }) => key)).toEqual(['routing-changed']);
  });

  it('skips unset timestamps', () => {
    const { all } = lifecycleRows(
      info({ lastCurrentTime: '1970-01-01T00:00:00Z' }),
      'Current',
    );
    expect(all.map(({ key }) => key)).not.toContain('last-current');
  });
});

describe('regionBlocks', () => {
  it('shows one block without a heading on a single-region Namespace', () => {
    const blocks = regionBlocks({
      scalingGroups: { default: lambdaGroup(EAST) },
    });
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ kind: 'group', heading: undefined });
  });

  it('stacks the primary then the replica on a Namespace with a replica', () => {
    const blocks = regionBlocks(
      {
        scalingGroups: {
          'aws-us-west-2': lambdaGroup(WEST, { regionIds: ['aws-us-west-2'] }),
          default: lambdaGroup(EAST),
        },
      },
      HA_REGIONS,
    );
    expect(blocks.map((b) => b.heading?.label)).toEqual([
      'us-east-1',
      'us-west-2',
    ]);
    const replica = blocks[1];
    expect(replica.kind === 'group' && replica.comparison?.differs.size).toBe(
      0,
    );
    expect(replica.kind === 'group' && replica.comparison?.primaryLabel).toBe(
      'us-east-1 · Primary',
    );
  });

  it('marks a replica with no group as missing', () => {
    const blocks = regionBlocks(
      { scalingGroups: { default: lambdaGroup(EAST) } },
      HA_REGIONS,
    );
    expect(blocks[1]).toMatchObject({
      kind: 'missing',
      heading: { label: 'us-west-2', role: 'replica' },
    });
  });

  it('shows nothing for a Version without Serverless Workers', () => {
    expect(regionBlocks(undefined, HA_REGIONS)).toEqual([]);
  });
});

describe('fieldsDifferingFromPrimary', () => {
  const decode = (group: ComputeConfigScalingGroup) =>
    regionBlocks({ scalingGroups: { g: group } })[0];

  it('expects a regional resource to differ only in its region', () => {
    const primary = decode(lambdaGroup(EAST));
    const replica = decode(lambdaGroup(WEST));
    if (primary.kind !== 'group' || replica.kind !== 'group') throw Error();
    expect(fieldsDifferingFromPrimary(primary.group, replica.group)).toEqual(
      new Set(),
    );
  });

  it('flags a different function version, role, and scaling value', () => {
    const primary = decode(lambdaGroup(EAST));
    const replica = decode(
      lambdaGroup(WEST.replace(':17', ':16'), {
        role: 'arn:aws:iam::123456789012:role/temporal-invoke-west',
        cooloffMs: 60000,
      }),
    );
    if (primary.kind !== 'group' || replica.kind !== 'group') throw Error();
    expect(fieldsDifferingFromPrimary(primary.group, replica.group)).toEqual(
      new Set(['lambdaArn', 'iamRoleArn', 'scaleUpCooloff']),
    );
  });
});

describe('metadataValue', () => {
  it('decodes a JSON string payload', () => {
    expect(metadataValue({ data: btoa('"a1b2c3d"') })).toBe('a1b2c3d');
  });

  it('shows a JSON object as JSON', () => {
    expect(metadataValue({ data: btoa('{"team":"payments"}') })).toBe(
      '{"team":"payments"}',
    );
  });

  it('shows plain text that is not JSON', () => {
    expect(metadataValue({ data: btoa('plain') })).toBe('plain');
  });
});

describe('durationToMs', () => {
  it('reads a proto Duration', () => {
    expect(durationToMs('130.5s')).toBe(130500);
  });

  it('returns undefined for no value', () => {
    expect(durationToMs(undefined)).toBeUndefined();
  });
});
