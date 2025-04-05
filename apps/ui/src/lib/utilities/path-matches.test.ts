import { describe, expect, it } from 'vitest';

import { pathMatches } from './path-matches';

describe('pathMatches', () => {
  it('should return true if given two of the exact same paths', () => {
    expect(pathMatches('/workflows', '/workflows')).toBe(true);
  });

  it('should return true if the second path is a subdirectory of the first', () => {
    expect(pathMatches('/workflows', '/workflows/abc')).toBe(true);
  });

  it('should return false if the second path is not a subdirectory of the first', () => {
    expect(pathMatches('/workflows', '/queries/abc')).toBe(false);
  });

  it('should ignore query params if missing from the first path and the paths otherwise match', () => {
    expect(pathMatches('/workflows', '/workflows?query=param')).toBe(true);
  });

  it('should ignore query params if missing from the second path and the paths otherwise match', () => {
    expect(pathMatches('/workflows?query=param', '/workflows')).toBe(true);
  });

  it('should ignore query params if missing from the first path and the paths do not match', () => {
    expect(pathMatches('/queries', '/workflows?query=param')).toBe(false);
  });

  it('should ignore query params if missing from the second path and the paths do not match', () => {
    expect(pathMatches('/workflows?query=param', '/queries')).toBe(false);
  });

  it('should ignore query params if the paths match but the parameters do not', () => {
    expect(pathMatches('/workflows?foo=bar', '/workflows?query=param')).toBe(
      true,
    );
  });

  it('should ignore query params if both the paths and parameters do not match', () => {
    expect(pathMatches('/workflows?query=param', '/queries?foo=bar')).toBe(
      false,
    );
  });

  it('should return false if exactMatch is true and paths are not exact matches', () => {
    expect(pathMatches('/workflows', '/workflows/events', true)).toBe(false);
  });
});
