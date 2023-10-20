import { describe, expect, it } from 'vitest';

import { getExpotentialBackoffSeconds } from './refresh-rate';

describe('pick', () => {
  it('should get initial backoff interval of 5 seconds', () => {
    expect(getExpotentialBackoffSeconds(5, 1)).toEqual(5);
  });

  it('should get backoff interval of 6 seconds on attempt 2', () => {
    expect(getExpotentialBackoffSeconds(5, 2)).toEqual(6);
  });

  it('should get backoff interval of 6 seconds on attempt 3', () => {
    expect(getExpotentialBackoffSeconds(5, 3)).toEqual(6);
  });

  it('should get backoff interval of 10 seconds on attempt 10', () => {
    expect(getExpotentialBackoffSeconds(5, 10)).toEqual(10);
  });

  it('should get backoff interval of 19 seconds on attempt 20', () => {
    expect(getExpotentialBackoffSeconds(5, 20)).toEqual(19);
  });

  it('should get backoff interval of 134 seconds on attempt 50', () => {
    expect(getExpotentialBackoffSeconds(5, 50)).toEqual(134);
  });

  it('should get max backoff interval of one hour on attempt 100', () => {
    expect(getExpotentialBackoffSeconds(5, 100)).toEqual(3600);
  });

  it('should still get max backoff interval of one hour on attempt 1000', () => {
    expect(getExpotentialBackoffSeconds(5, 1000)).toEqual(3600);
  });
});
