import { describe, expect, it } from 'vitest';

import { parseNamespaceRegions } from './demo-namespace-regions';

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
