import { describe, expect, it } from 'vitest';

import { configuredRegions, deployRegionsFor } from './compute-provider-config';

describe('configuredRegions', () => {
  it('is empty without a config or regions', () => {
    expect(configuredRegions(undefined)).toEqual([]);
    expect(configuredRegions({})).toEqual([]);
  });

  it('returns the Namespace regions from the config', () => {
    const regions = [
      { regionId: 'aws-us-east-1', role: 'primary' as const },
      { regionId: 'aws-us-west-2', role: 'replica' as const },
    ];

    expect(configuredRegions({ regions })).toEqual(regions);
  });
});

describe('deployRegionsFor', () => {
  it('returns the deploy regions of the named provider', () => {
    expect(
      deployRegionsFor(
        {
          providers: [
            { value: 'lambda' },
            { value: 'cloud-run', deployRegions: ['us-central1'] },
          ],
        },
        'cloud-run',
      ),
    ).toEqual(['us-central1']);
  });

  it('is undefined when the provider is absent or sets none', () => {
    expect(deployRegionsFor(undefined, 'cloud-run')).toBeUndefined();
    expect(
      deployRegionsFor({ providers: [{ value: 'cloud-run' }] }, 'cloud-run'),
    ).toBeUndefined();
  });
});
