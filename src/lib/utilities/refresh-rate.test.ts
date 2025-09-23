import { describe, expect, it } from 'vitest';

import { getExponentialBackoff } from './refresh-rate';

describe('getExponentialBackoff', () => {
  it('should get initial backoff interval of 5 seconds', () => {
    expect(getExponentialBackoff(5, 1, 100)).toEqual(5000);
  });

  it('should get backoff interval of 6 seconds on attempt 2', () => {
    expect(getExponentialBackoff(5, 2, 100)).toEqual(6000);
  });

  it('should get backoff interval of 6 seconds on attempt 3', () => {
    expect(getExponentialBackoff(5, 3, 100)).toEqual(6000);
  });

  it('should get backoff interval of 10 seconds on attempt 10', () => {
    expect(getExponentialBackoff(5, 10, 100)).toEqual(10000);
  });

  it('should get backoff interval of 19 seconds on attempt 20', () => {
    expect(getExponentialBackoff(5, 20, 100)).toEqual(19000);
  });

  it('should get backoff interval of 134 seconds on attempt 50', () => {
    expect(getExponentialBackoff(5, 50, 100)).toEqual(134000);
  });

  it('should get max backoff interval of one hour on attempt 100', () => {
    expect(getExponentialBackoff(5, 100, 100)).toEqual(3600000);
  });

  it('should still get max backoff interval of one hour on attempt 1000', () => {
    expect(getExponentialBackoff(5, 1000, 100)).toEqual(3600000);
  });
});
