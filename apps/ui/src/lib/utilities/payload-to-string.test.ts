import { describe, expect, it } from 'vitest';

import { payloadToString } from './payload-to-string';

describe('payloadToString', () => {
  it('should combine payloads into a string if it is an array of payloads', () => {
    expect(payloadToString(['a'])).toBe('a');
    expect(payloadToString(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('should return the payload if the payload is not an array of payloads', () => {
    expect(payloadToString('a')).toBe('a');
    expect(payloadToString(['a, b, c'])).toBe('a, b, c');
  });
});
