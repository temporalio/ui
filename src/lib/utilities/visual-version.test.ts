import { describe, expect, it } from 'vitest';

import { resolveVisualVersion } from './visual-version';

describe('resolveVisualVersion', () => {
  it('uses v2 by default', () => {
    expect(resolveVisualVersion({})).toBe('v2');
  });

  it('supports a deployment-level fallback', () => {
    expect(resolveVisualVersion({ configured: 'legacy' })).toBe('legacy');
  });

  it('prefers local storage over deployment configuration', () => {
    expect(resolveVisualVersion({ configured: 'legacy', stored: 'v2' })).toBe(
      'v2',
    );
  });

  it('prefers a query override over every other source', () => {
    expect(
      resolveVisualVersion({
        configured: 'legacy',
        stored: 'legacy',
        query: 'v2',
      }),
    ).toBe('v2');
  });

  it('accepts JSON-encoded stored values', () => {
    expect(resolveVisualVersion({ stored: '"legacy"' })).toBe('legacy');
  });

  it('ignores invalid values', () => {
    expect(
      resolveVisualVersion({
        configured: 'future',
        stored: 'unknown',
        query: 'invalid',
      }),
    ).toBe('v2');
  });
});
