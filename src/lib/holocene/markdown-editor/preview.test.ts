import { describe, expect, it } from 'vitest';

import { normalizePreviewContent } from './preview';

describe('normalizePreviewContent', () => {
  it('preserves line breaks by default', () => {
    const content = 'First line  \nSecond line';

    expect(normalizePreviewContent(content, false)).toBe(content);
  });

  it('removes line breaks in single-line mode', () => {
    expect(normalizePreviewContent('First line  \nSecond line', true)).toBe(
      'First line Second line',
    );
  });

  it('preserves inline Markdown in single-line mode', () => {
    const content = '[Link](https://temporal.io) and **bold text**';

    expect(normalizePreviewContent(content, true)).toBe(content);
  });
});
