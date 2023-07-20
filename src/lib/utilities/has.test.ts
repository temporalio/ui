import { describe, expect, it } from 'vitest';

import { has, hasAnyProperties } from './has';

describe('has', () => {
  it('returns true if an object has a key', () => {
    const source = { foo: 123 };
    expect(has(source, 'foo')).toBe(true);
  });

  it('returns false if an object does not have key', () => {
    const source = { foo: 123 };
    expect(has(source, 'bar')).toBe(false);
  });

  it('returns true if an object has a multiple keys', () => {
    const source = { foo: 123, bar: 456 };
    expect(has(source, 'foo', 'bar')).toBe(true);
  });

  it('returns false if an object has a no keys', () => {
    const source = {};
    expect(has(source, 'foo', 'bar')).toBe(false);
  });

  it('returns false if an object does not have the required keys', () => {
    const source = { foo: 123 };
    expect(has(source, 'foo', 'bar')).toBe(false);
  });

  it('returns false if an object has no keys', () => {
    const source = {};
    expect(has(source)).toBe(false);
  });

  it('should return false if given null', () => {
    expect(has(null)).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(has(undefined)).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(has(3)).toBe(false);
  });

  it('should return false if given a boolean', () => {
    expect(has(true)).toBe(false);
  });
});

describe('hasAnyProperties', () => {
  it('returns true if an object has enumerable properties', () => {
    const source = { foo: 123 };
    expect(hasAnyProperties(source)).toBe(true);
  });

  it('returns true if an object has non-enumerable properties', () => {
    const error = new Error();
    expect(hasAnyProperties(error)).toBe(true);
  });

  it('returns false if an object has no keys', () => {
    const source = {};
    expect(hasAnyProperties(source)).toBe(false);
  });

  it('should return false if given null', () => {
    expect(hasAnyProperties(null)).toBe(false);
  });

  it('should return false if given undefined', () => {
    expect(hasAnyProperties(undefined)).toBe(false);
  });

  it('should return false if given a number', () => {
    expect(hasAnyProperties(3)).toBe(false);
  });

  it('should return false if given a boolean', () => {
    expect(hasAnyProperties(true)).toBe(false);
  });
});
