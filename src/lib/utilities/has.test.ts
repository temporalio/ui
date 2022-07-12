import { describe, expect, it } from 'vitest';
import { has, hasKeys } from './has';

describe('has', () => {
  it('returns true if an object has a key', () => {
    const source = { foo: 123 };
    expect(has(source, 'foo')).toBe(true);
  });

  it('returns false if an object does not have key', () => {
    const source = { foo: 123 };
    expect(has(source, 'bar')).toBe(false);
  });
});

describe('hasKeys', () => {
  it('returns true if an object has keys', () => {
    const source = { foo: 123 };
    expect(hasKeys(source)).toBe(true);
  });

  it('returns false if an object has no keys', () => {
    const source = {};
    expect(hasKeys(source)).toBe(false);
  });

  it('should return false if given null', () => {
    expect(hasKeys(null as unknown as Parameters<typeof hasKeys>[0])).toBe(
      false,
    );
  });

  it('should return false if given undefined', () => {
    expect(hasKeys(undefined as unknown as Parameters<typeof hasKeys>[0])).toBe(
      false,
    );
  });

  it('should return false if given a number', () => {
    expect(hasKeys(3 as unknown as Parameters<typeof hasKeys>[0])).toBe(false);
  });

  it('should return false if given a boolean', () => {
    expect(hasKeys(true as unknown as Parameters<typeof hasKeys>[0])).toBe(
      false,
    );
  });
});
