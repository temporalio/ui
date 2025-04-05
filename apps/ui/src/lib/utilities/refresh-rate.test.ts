import { describe, expect, it } from 'vitest';

import { getExponentialBackoffSeconds } from './refresh-rate';

describe('getExponentialBackoffSeconds', () => {
  it('should get initial backoff interval of 5 seconds', () => {
    expect(getExponentialBackoffSeconds(5, 1, 100)).toEqual(5);
  });

  it('should get backoff interval of 6 seconds on attempt 2', () => {
    expect(getExponentialBackoffSeconds(5, 2, 100)).toEqual(6);
  });

  it('should get backoff interval of 6 seconds on attempt 3', () => {
    expect(getExponentialBackoffSeconds(5, 3, 100)).toEqual(6);
  });

  it('should get backoff interval of 10 seconds on attempt 10', () => {
    expect(getExponentialBackoffSeconds(5, 10, 100)).toEqual(10);
  });

  it('should get backoff interval of 19 seconds on attempt 20', () => {
    expect(getExponentialBackoffSeconds(5, 20, 100)).toEqual(19);
  });

  it('should get backoff interval of 134 seconds on attempt 50', () => {
    expect(getExponentialBackoffSeconds(5, 50, 100)).toEqual(134);
  });

  it('should get max backoff interval of one hour on attempt 100', () => {
    expect(getExponentialBackoffSeconds(5, 100, 100)).toEqual(3600);
  });

  it('should still get max backoff interval of one hour on attempt 1000', () => {
    expect(getExponentialBackoffSeconds(5, 1000, 100)).toEqual(3600);
  });
});
