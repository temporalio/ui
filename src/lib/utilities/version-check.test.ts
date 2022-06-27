import { describe, expect, it } from 'vitest';
import { isRecommendedVersionNewer } from './version-check';

describe('isRecommendedVersionNewer', () => {
  it('should return true when recommended version is higher than current', () => {
    expect(isRecommendedVersionNewer('2.01.1', '1.01.1')).toBe(true);
    expect(isRecommendedVersionNewer('1.02.1', '1.01.1')).toBe(true);
    expect(isRecommendedVersionNewer('1.01.2', '1.01.1')).toBe(true);
    expect(isRecommendedVersionNewer('1.02', '1.01')).toBe(true);
    expect(isRecommendedVersionNewer('2', '1')).toBe(true);
  });

  it('should return false when recommended version is not higher than current', () => {
    expect(isRecommendedVersionNewer('1.01.1', '1.01.1')).toBe(false);
    expect(isRecommendedVersionNewer('1.01.1', '2.01.1')).toBe(false);
    expect(isRecommendedVersionNewer('1.01.1', '1.02.1')).toBe(false);
    expect(isRecommendedVersionNewer('1.01.1', '1.01.2')).toBe(false);
    expect(isRecommendedVersionNewer(undefined, '1.01.1')).toBe(false);
    expect(isRecommendedVersionNewer('1.01.1', undefined)).toBe(false);
    expect(isRecommendedVersionNewer(undefined, undefined)).toBe(false);
    expect(isRecommendedVersionNewer('xxx', '1.01.1')).toBe(false);
    expect(isRecommendedVersionNewer('1.1', '1.01.1')).toBe(false);
    expect(isRecommendedVersionNewer('1.01', '1.02')).toBe(false);
    expect(isRecommendedVersionNewer('1', '2')).toBe(false);
  });
});
