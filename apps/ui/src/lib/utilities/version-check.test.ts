import { describe, expect, it } from 'vitest';

import { isVersionNewer, minimumVersionRequired } from './version-check';

describe('isRecommendedVersionNewer', () => {
  it('should return true when recommended version is higher than current', () => {
    expect(isVersionNewer('2.01.1', '1.01.1')).toBe(true);
    expect(isVersionNewer('1.02.1', '1.01.1')).toBe(true);
    expect(isVersionNewer('1.01.2', '1.01.1')).toBe(true);
    expect(isVersionNewer('1.02', '1.01')).toBe(true);
    expect(isVersionNewer('2', '1')).toBe(true);
    expect(isVersionNewer('1.20.0', '1.19')).toBe(true);
  });

  it('should return false when recommended version is not higher than current', () => {
    expect(isVersionNewer('1.01.1', '1.01.1')).toBe(false);
    expect(isVersionNewer('1.01.1', '2.01.1')).toBe(false);
    expect(isVersionNewer('1.01.1', '1.02.1')).toBe(false);
    expect(isVersionNewer('1.01.1', '1.01.2')).toBe(false);
    expect(isVersionNewer(undefined, '1.01.1')).toBe(false);
    expect(isVersionNewer('1.01.1', undefined)).toBe(false);
    expect(isVersionNewer(undefined, undefined)).toBe(false);
    expect(isVersionNewer('xxx', '1.01.1')).toBe(false);
    expect(isVersionNewer('1.1', '1.01.1')).toBe(false);
    expect(isVersionNewer('1.01', '1.02')).toBe(false);
    expect(isVersionNewer('1', '2')).toBe(false);
    expect(isVersionNewer('1.19.3', '1.19')).toBe(false);
  });
});

describe('minimumVersionRequired', () => {
  it('should return true when current version is equal to or higher than minimum', () => {
    expect(minimumVersionRequired('1.20.0', '1.20.0')).toBe(true);
    expect(minimumVersionRequired('1.20.1', '1.20.2')).toBe(true);
    expect(minimumVersionRequired('1.20.5', '1.21')).toBe(true);
    expect(minimumVersionRequired('1.20.5', '2')).toBe(true);
    expect(minimumVersionRequired('1.20', '1.20')).toBe(true);
    expect(minimumVersionRequired('1', '1')).toBe(true);
    expect(minimumVersionRequired('1', '2')).toBe(true);
    expect(minimumVersionRequired('1', '1.20')).toBe(true);
  });
  it('should return true when current release candidate version is equal to or higher than minimum', () => {
    expect(minimumVersionRequired('1.23', '1.23.0-rc.19')).toBe(true);
  });

  it('should return false when current version is less than than minimum', () => {
    expect(minimumVersionRequired('1.20.1', '1.20.0')).toBe(false);
    expect(minimumVersionRequired('1.20.0', '1.19.0')).toBe(false);
    expect(minimumVersionRequired('1.20.0', '1.19.5')).toBe(false);
    expect(minimumVersionRequired('1.20', '1.19.5')).toBe(false);
    expect(minimumVersionRequired('1.20', '1.19')).toBe(false);
    expect(minimumVersionRequired('2', '1')).toBe(false);
    expect(minimumVersionRequired('1.20.0', '1.20')).toBe(false);
    expect(minimumVersionRequired('1.20.0', '')).toBe(false);
    expect(minimumVersionRequired('', '1.30')).toBe(false);
  });
});
