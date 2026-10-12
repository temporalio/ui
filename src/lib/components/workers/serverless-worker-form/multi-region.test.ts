import { describe, expect, it, test } from 'vitest';

import {
  computeRegionsFor,
  previewSlot,
  regionServerErrors,
  shortResourceName,
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

  it('places nothing without regions', () => {
    expect(regionServerErrors('aws-us-east-1: denied', undefined)).toEqual({});
  });
});
