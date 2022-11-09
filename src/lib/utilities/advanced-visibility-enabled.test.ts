import { describe, expect, it } from 'vitest';
import { advancedVisibilityEnabled } from './advanced-visibility-enabled';

describe('advancedVisbilityEnabled', () => {
  it('returns true when "elasticsearch" is included in the cluster\'s visbilityStores', () => {
    expect(
      advancedVisibilityEnabled({ visibilityStore: 'elasticsearch,mysql' }),
    ).toBe(true);
  });

  it('returns true when "elasticsearch" is the only value in the cluster\'s visbilityStores', () => {
    expect(
      advancedVisibilityEnabled({ visibilityStore: 'elasticsearch' }),
    ).toBe(true);
  });

  it('returns false when "elasticsearch" is not included in the cluster\'s visbilityStores', () => {
    expect(advancedVisibilityEnabled({ visibilityStore: 'mysql' })).toBe(true);
  });
});
