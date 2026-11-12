import { describe, expect, it } from 'vitest';

import { isValidSignalInput, signalNames } from './signal-input';

describe('isValidSignalInput', () => {
  it('accepts empty input and JSON', () => {
    expect(isValidSignalInput('  ')).toBe(true);
    expect(isValidSignalInput('{"approved": true}')).toBe(true);
    expect(isValidSignalInput('"text"')).toBe(true);
  });

  it('rejects text that is not JSON', () => {
    expect(isValidSignalInput('{approved}')).toBe(false);
    expect(isValidSignalInput('approve')).toBe(false);
  });
});

describe('signalNames', () => {
  it('keeps named definitions once, sorted', () => {
    expect(
      signalNames([
        { name: 'cancel' },
        {},
        { name: 'approve' },
        { name: 'cancel' },
      ]),
    ).toEqual(['approve', 'cancel']);
    expect(signalNames(undefined)).toEqual([]);
  });
});
