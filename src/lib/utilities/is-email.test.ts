import { describe, expect, it } from 'vitest';

import { emailSchema, isEmail } from './is-email';

describe('isEmail', () => {
  it('returns true for a valid email address', () => {
    expect(isEmail('test@example.com')).toBe(true);
  });

  it('returns true for a valid email with subdomains', () => {
    expect(isEmail('test@sub.example.com')).toBe(true);
  });

  it('returns true for a valid email with plus addressing', () => {
    expect(isEmail('test+tag@example.com')).toBe(true);
  });

  it('returns true for a valid email with numbers', () => {
    expect(isEmail('test123@example.com')).toBe(true);
  });

  it('returns true for a valid email with period in local part', () => {
    expect(isEmail('first.last@example.com')).toBe(true);
  });

  it('returns true for a valid email with special characters in local part', () => {
    expect(isEmail('user-name@example.com')).toBe(true);
    expect(isEmail('user_name@example.com')).toBe(true);
  });

  it('returns true for a valid email with short TLD', () => {
    expect(isEmail('test@example.io')).toBe(true);
  });

  it('returns false for a string without @ symbol', () => {
    expect(isEmail('testexample.com')).toBe(false);
  });

  it('returns false for a string with only @ symbol', () => {
    expect(isEmail('@')).toBe(false);
  });

  it('returns false for a string with multiple @ symbols', () => {
    expect(isEmail('test@example@com')).toBe(false);
  });

  it('returns false for a string with no domain part', () => {
    expect(isEmail('test@')).toBe(false);
  });

  it('returns false for a string with no local part', () => {
    expect(isEmail('@example.com')).toBe(false);
  });

  it('returns false for a string with invalid TLD', () => {
    expect(isEmail('test@example')).toBe(false);
  });

  it('returns false for a string with spaces', () => {
    expect(isEmail('test user@example.com')).toBe(false);
    expect(isEmail('test@example com')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isEmail('')).toBe(false);
  });

  it('returns false for null or undefined (type coercion)', () => {
    // @ts-expect-error: Testing with null
    expect(isEmail(null)).toBe(false);
    // @ts-expect-error: Testing with undefined
    expect(isEmail(undefined)).toBe(false);
  });

  it('returns false for non-string values (type coercion)', () => {
    // @ts-expect-error: Testing with number
    expect(isEmail(123)).toBe(false);
    // @ts-expect-error: Testing with object
    expect(isEmail({})).toBe(false);
    // @ts-expect-error: Testing with array
    expect(isEmail([])).toBe(false);
  });
});

describe('emailSchema', () => {
  it('successfully parses valid email addresses', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
  });

  it('fails to parse invalid email addresses', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
  });

  it('includes error message when parsing fails', () => {
    const result = emailSchema.safeParse('not-an-email');
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email');
    } else {
      // This should never execute if the test is working correctly
      expect(false).toBe(true);
    }
  });
});
