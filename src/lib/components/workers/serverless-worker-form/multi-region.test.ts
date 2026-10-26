import { describe, expect, it, test } from 'vitest';

import {
  computeRegionsFor,
  previewSlot,
  regionServerErrors,
  replicaRegionFor,
  resourceRegion,
  shortResourceName,
  splitHighAvailabilityGroups,
  suggestRegionalArn,
  truncateMiddle,
} from './multi-region';

describe('suggestRegionalArn', () => {
  test('swaps the Region of a Lambda ARN, keeping the qualifier', () => {
    expect(
      suggestRegionalArn(
        'arn:aws:lambda:us-east-1:123456789012:function:orders-worker:17',
        'us-west-2',
      ),
    ).toBe('arn:aws:lambda:us-west-2:123456789012:function:orders-worker:17');
  });

  test('swaps the Region of an AgentCore endpoint ARN', () => {
    expect(
      suggestRegionalArn(
        'arn:aws:bedrock-agentcore:eu-central-1:123456789012:runtime/orders',
        'eu-west-1',
      ),
    ).toBe('arn:aws:bedrock-agentcore:eu-west-1:123456789012:runtime/orders');
  });

  test('returns empty for partial or region-less input', () => {
    expect(suggestRegionalArn('', 'us-west-2')).toBe('');
    expect(suggestRegionalArn('arn:aws:lambda:us-ea', 'us-west-2')).toBe('');
    expect(
      suggestRegionalArn('arn:aws:iam::123456789012:role/x', 'us-west-2'),
    ).toBe('');
  });
});

describe('shortResourceName', () => {
  test('keeps the function name and qualifier of a Lambda ARN', () => {
    expect(
      shortResourceName(
        'arn:aws:lambda:us-east-1:123456789012:function:orders-worker:17',
      ),
    ).toBe('orders-worker:17');
  });

  test('keeps the last segment of other ARNs and names', () => {
    expect(
      shortResourceName('arn:aws:iam::123456789012:role/Temporal-Worker'),
    ).toBe('Temporal-Worker');
    expect(shortResourceName('projects/p/workerPools/orders')).toBe('orders');
  });
});

describe('previewSlot', () => {
  test('is missing without a value', () => {
    expect(previewSlot('')).toEqual({ value: '', state: 'missing' });
  });

  test('shortens the value and keeps the given state', () => {
    expect(
      previewSlot(
        'arn:aws:lambda:us-west-2:123456789012:function:orders-worker:17',
        'suggested',
      ),
    ).toEqual({
      value: 'orders-worker:17',
      full: 'arn:aws:lambda:us-west-2:123456789012:function:orders-worker:17',
      state: 'suggested',
    });
  });
});

describe('truncateMiddle', () => {
  test('leaves short values alone', () => {
    expect(truncateMiddle('1.0.0')).toBe('1.0.0');
  });

  test('keeps the start and end of long values', () => {
    const value = truncateMiddle('7706e295-b501-4d44-9fec-1ce52ccbe92b');
    expect(value).toBe('7706e295…ccbe92b');
    expect(value).toHaveLength(16);
  });
});

describe('computeRegionsFor', () => {
  it('puts the primary first whatever order the regions arrive in', () => {
    expect(
      computeRegionsFor(
        [
          { regionId: 'aws-us-west-2', role: 'replica' },
          { regionId: 'aws-us-east-1', role: 'primary' },
        ],
        'lambda',
      ),
    ).toEqual([
      {
        id: 'aws-us-east-1',
        role: 'primary',
        label: undefined,
        provider: 'lambda',
      },
      {
        id: 'aws-us-west-2',
        role: 'replica',
        label: undefined,
        provider: 'lambda',
      },
    ]);
  });

  it('keeps the label a consumer supplied', () => {
    const [region] = computeRegionsFor(
      [{ regionId: 'aws-us-east-1', role: 'primary', label: 'us-east-1' }],
      'lambda',
    );
    expect(region.label).toBe('us-east-1');
  });

  it('keeps the provider region name a consumer supplied', () => {
    const [region] = computeRegionsFor(
      [
        {
          regionId: 'aws-us-east-1',
          role: 'primary',
          providerRegion: 'us-east-1',
        },
      ],
      'lambda',
    );
    expect(region).toMatchObject({
      label: undefined,
      providerRegion: 'us-east-1',
    });
  });
});

describe('regionServerErrors', () => {
  const regions = computeRegionsFor(
    [
      { regionId: 'aws-us-east-1', role: 'primary' },
      { regionId: 'aws-us-west-2', role: 'replica' },
    ],
    'lambda',
  );

  it('places an error under the region its group key names', () => {
    expect(
      regionServerErrors(
        'aws-us-west-2: cannot connect to the compute provider',
        regions,
      ),
    ).toEqual({ 'aws-us-west-2': 'cannot connect to the compute provider' });
  });

  it.each([
    ['no error', undefined],
    ['an error that names no region', 'something went wrong'],
    ['a region without the separator', 'aws-us-west-2 is unreachable'],
  ])('places nothing for %s', (_name, error) => {
    expect(regionServerErrors(error, regions)).toEqual({});
  });

  it('places an error on the default group under the primary', () => {
    // The primary saves as the default group, so the server names it so.
    expect(regionServerErrors('default: access denied', regions)).toEqual({
      'aws-us-east-1': 'access denied',
    });
  });

  it('places nothing without regions', () => {
    expect(regionServerErrors('aws-us-east-1: denied', undefined)).toEqual({});
  });
});

describe('resourceRegion', () => {
  const fields = (over: Partial<Record<string, string>>) => ({
    lambdaArn: '',
    agentCoreEndpointArn: '',
    gcpRegion: '',
    ...over,
  });

  it('reads the region from a Lambda ARN', () => {
    expect(
      resourceRegion(
        'lambda',
        fields({
          lambdaArn: 'arn:aws:lambda:us-west-2:123456789012:function:w',
        }),
      ),
    ).toBe('us-west-2');
  });

  it('reads the region from an AgentCore endpoint ARN', () => {
    expect(
      resourceRegion(
        'agentcore',
        fields({
          agentCoreEndpointArn:
            'arn:aws:bedrock-agentcore:eu-west-1:123456789012:runtime/r/runtime-endpoint/e',
        }),
      ),
    ).toBe('eu-west-1');
  });

  it('takes a Cloud Run worker pool region as it is', () => {
    expect(
      resourceRegion('cloud-run', fields({ gcpRegion: 'us-central1' })),
    ).toBe('us-central1');
  });

  it.each([
    ['an empty ARN', ''],
    ['a partial ARN', 'arn:aws:lambda:'],
    ['something else', 'orders-worker'],
  ])('has no region for %s', (_name, lambdaArn) => {
    expect(resourceRegion('lambda', fields({ lambdaArn }))).toBeUndefined();
  });
});

describe('replicaRegionFor', () => {
  const options = computeRegionsFor(
    [
      {
        regionId: 'aws-us-west-2',
        providerRegion: 'us-west-2',
        role: 'replica',
      },
      {
        regionId: 'aws-us-west-1',
        providerRegion: 'us-west-1',
        role: 'replica',
      },
    ],
    'lambda',
  );

  it('finds the offered region by its provider region name', () => {
    expect(replicaRegionFor('us-west-1', options)?.id).toBe('aws-us-west-1');
  });

  it('finds nothing for a region that is not offered', () => {
    // e.g. a replica pointed back at the primary's region
    expect(replicaRegionFor('us-east-1', options)).toBeUndefined();
  });

  it('finds nothing before a resource names a region', () => {
    expect(replicaRegionFor(undefined, options)).toBeUndefined();
  });
});

describe('splitHighAvailabilityGroups', () => {
  const WEST = 'aws-us-west-2';
  const config = (groups: Record<string, { regionIds?: string[] }>) => ({
    scalingGroups: groups,
  });

  it('reads the unscoped group as the primary and the scoped one as the replica', () => {
    const { primary, replica } = splitHighAvailabilityGroups(
      config({ default: {}, secondary: { regionIds: [WEST] } }),
      WEST,
    );
    expect(primary?.name).toBe('default');
    expect(replica?.name).toBe('secondary');
  });

  it('has no replica when no group names the Namespace replica', () => {
    const { primary, replica } = splitHighAvailabilityGroups(
      config({ default: {} }),
      WEST,
    );
    expect(primary?.name).toBe('default');
    expect(replica).toBeUndefined();
  });

  it('takes a group scoped elsewhere as the primary when none is unscoped', () => {
    const { primary, replica } = splitHighAvailabilityGroups(
      config({
        east: { regionIds: ['aws-us-east-1'] },
        west: { regionIds: [WEST] },
      }),
      WEST,
    );
    expect(primary?.name).toBe('east');
    expect(replica?.name).toBe('west');
  });

  it('reads a single-region Namespace as a primary only', () => {
    const { primary, replica } = splitHighAvailabilityGroups(
      config({ default: {} }),
      undefined,
    );
    expect(primary?.name).toBe('default');
    expect(replica).toBeUndefined();
  });
});
