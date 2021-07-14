import { pathMatches } from './path-matches';

describe(pathMatches, () => {
  it('should return true if given two of the exact same paths', () => {
    expect(pathMatches('/workflows', '/workflows')).toBe(true);
  });

  it('should return true if the second path is a subdirectory of the first', () => {
    expect(pathMatches('/workflows', '/workflows/abc')).toBe(true);
  });

  it('should return false if the second path is not a subdirectory of the first', () => {
    expect(pathMatches('/workflows', '/queries/abc')).toBe(false);
  });
});
