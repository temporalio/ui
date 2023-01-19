import { describe, expect, it } from 'vitest';
import { has, hasAnyKeys, hasKeys } from './has';

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

describe('hasAnyKeys', () => {
  it('returns true if an object has keys', () => {
    const source = { foo: 123 };
    expect(hasAnyKeys(source)).toBe(true);
  });

  it('returns false if an object has no keys', () => {
    const source = {};
    expect(hasAnyKeys(source)).toBe(false);
  });

  it('should return false if given null', () => {
    expect(
      hasAnyKeys(null as unknown as Parameters<typeof hasAnyKeys>[0]),
    ).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(
      hasAnyKeys(undefined as unknown as Parameters<typeof hasAnyKeys>[0]),
    ).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(hasAnyKeys(3 as unknown as Parameters<typeof hasAnyKeys>[0])).toBe(
      false,
    );
  });

  it('should return false if given a boolean', () => {
    expect(
      hasAnyKeys(true as unknown as Parameters<typeof hasAnyKeys>[0]),
    ).toBe(false);
  });
});

describe('hasKeys', () => {
  it('returns true if an object has a key', () => {
    const source = { foo: 123 };
    expect(hasKeys(source, 'foo')).toBe(true);
  });

  it('returns true if an object has a multiple keys', () => {
    const source = { foo: 123, bar: 456 };
    expect(hasKeys(source, 'foo', 'bar')).toBe(true);
  });

  it('returns false if an object has a no keys', () => {
    const source = {};
    expect(hasKeys(source, 'foo', 'bar')).toBe(false);
  });

  it('returns false if an object does not have the required keys', () => {
    const source = { foo: 123 };
    expect(hasKeys(source, 'foo', 'bar')).toBe(false);
  });
});
