import { describe, expect, it } from 'vitest';

import { advancedVisibilityEnabled } from './advanced-visibility-enabled';

describe('advancedVisbilityEnabled', () => {
  it('returns true when "elasticsearch" is included in the cluster\'s visbilityStores', () => {
    expect(
      advancedVisibilityEnabled(
        { visibilityStore: 'elasticsearch,mysql' },
        '1.18',
      ),
    ).toBe(true);
  });

  it('returns true when "elasticsearch" is the only value in the cluster\'s visbilityStores', () => {
    expect(
      advancedVisibilityEnabled({ visibilityStore: 'elasticsearch' }, '1.18'),
    ).toBe(true);
  });

  it('returns false when "elasticsearch" is not included in the cluster\'s visbilityStores', () => {
    expect(
      advancedVisibilityEnabled({ visibilityStore: 'mysql' }, '1.19'),
    ).toBe(false);
  });

  it('returns true when "elasticsearch" is not included in the cluster\'s visbilityStores but server version is >= 1.20', () => {
    expect(
      advancedVisibilityEnabled({ visibilityStore: 'mysql' }, '1.20'),
    ).toBe(true);
  });
});
