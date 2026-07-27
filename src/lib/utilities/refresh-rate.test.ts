import { describe, expect, it } from 'vitest';

import { getExponentialBackoff } from './refresh-rate';

describe('getExponentialBackoff with 5 seconds', () => {
  it('should get initial backoff interval of 5 seconds', () => {
    expect(getExponentialBackoff(5, 1)).toEqual(5000);
  });

  it('should get backoff interval of 6 seconds on attempt 2', () => {
    expect(getExponentialBackoff(5, 2)).toEqual(6000);
  });

  it('should get backoff interval of 7 seconds on attempt 3', () => {
    expect(getExponentialBackoff(5, 3)).toEqual(7000);
  });

  it('should get backoff interval of 26 seconds on attempt 10', () => {
    expect(getExponentialBackoff(5, 10)).toEqual(26000);
  });

  it('should get backoff interval of 160 seconds on attempt 20', () => {
    expect(getExponentialBackoff(5, 20)).toEqual(160000);
  });

  it('should get max backoff interval of five minutes on attempt 50', () => {
    expect(getExponentialBackoff(5, 50)).toEqual(300000);
  });
});

describe('getExponentialBackoff with 60 seconds', () => {
  it('should get initial backoff interval of 60 seconds', () => {
    expect(getExponentialBackoff(60, 1)).toEqual(60000);
  });

  it('should get backoff interval of 72 seconds on attempt 2', () => {
    expect(getExponentialBackoff(60, 2)).toEqual(72000);
  });

  it('should get backoff interval of 86 seconds on attempt 3', () => {
    expect(getExponentialBackoff(60, 3)).toEqual(86000);
  });

  it('should get max backoff interval of 5 minutes on attempt 10', () => {
    expect(getExponentialBackoff(60, 10)).toEqual(300000);
  });
});
