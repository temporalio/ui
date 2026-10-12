import { describe, expect, it } from 'vitest';

import { parseNamespaceRegions, parseReplicaRegions } from './env-regions';

describe('parseNamespaceRegions', () => {
  it('reads each region with the role it states', () => {
    expect(
      parseNamespaceRegions('aws-us-east-1:primary,aws-us-west-2:replica'),
    ).toEqual([
      { regionId: 'aws-us-east-1', role: 'primary' },
      { regionId: 'aws-us-west-2', role: 'replica' },
    ]);
  });

  it('keeps the stated role whatever the order', () => {
    expect(
      parseNamespaceRegions('aws-us-west-2:replica,aws-us-east-1:primary'),
    ).toEqual([
      { regionId: 'aws-us-west-2', role: 'replica' },
      { regionId: 'aws-us-east-1', role: 'primary' },
    ]);
  });

  it('keeps a label given after the region', () => {
    expect(
      parseNamespaceRegions(
        'aws-us-east-1=us-east-1:primary,aws-us-west-2:replica',
      ),
    ).toEqual([
      { regionId: 'aws-us-east-1', label: 'us-east-1', role: 'primary' },
      { regionId: 'aws-us-west-2', role: 'replica' },
    ]);
  });

  it('ignores spaces around entries', () => {
    expect(parseNamespaceRegions(' aws-us-east-1:primary , ')).toEqual([
      { regionId: 'aws-us-east-1', role: 'primary' },
    ]);
  });

  it.each([
    ['unset', undefined],
    ['empty', ''],
    ['no role', 'aws-us-east-1'],
    ['unknown role', 'aws-us-east-1:active'],
    ['no region', ':primary'],
  ])('returns no regions when %s', (_name, value) => {
    expect(parseNamespaceRegions(value)).toEqual([]);
  });
});

describe('parseReplicaRegions', () => {
  it('gives each provider the replica regions named for it', () => {
    const providers = parseReplicaRegions(
      'lambda:aws-us-west-2,lambda:aws-us-west-1,cloud-run:gcp-us-east1',
    );

    expect(providers?.find(({ value }) => value === 'lambda')).toEqual({
      value: 'lambda',
      replicaRegions: [
        { regionId: 'aws-us-west-2' },
        { regionId: 'aws-us-west-1' },
      ],
    });
    expect(
      providers?.find(({ value }) => value === 'cloud-run')?.replicaRegions,
    ).toEqual([{ regionId: 'gcp-us-east1' }]);
    // A provider nobody named is not offered, as a consumer offers only the
    // providers that match its Namespace's cloud.
    expect(providers?.map(({ value }) => value)).toEqual([
      'lambda',
      'cloud-run',
    ]);
  });

  it('keeps a label given after a replica region', () => {
    expect(
      parseReplicaRegions('lambda:aws-us-west-2=us-west-2')?.find(
        ({ value }) => value === 'lambda',
      )?.replicaRegions,
    ).toEqual([{ regionId: 'aws-us-west-2', label: 'us-west-2' }]);
  });

  it.each([
    ['unset', undefined],
    ['empty', ''],
    ['an unknown provider', 'azure:eastus'],
    ['no region', 'lambda:'],
  ])('leaves the default providers when %s', (_name, value) => {
    expect(parseReplicaRegions(value)).toBeUndefined();
  });
});
