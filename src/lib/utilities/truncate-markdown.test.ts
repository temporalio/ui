import { describe, expect, it } from 'vitest';

import { markdownVisibleLength, truncateMarkdown } from './truncate-markdown';

describe('markdownVisibleLength', () => {
  it('returns the string length for plain text', () => {
    expect(markdownVisibleLength('hello world')).toBe(11);
  });

  it('counts only the link label, not the URL', () => {
    const md = '[Activity logs](https://example.test/reports/segment/segment/)';
    // "Activity logs" is 13 chars; brackets, parens and URL are excluded
    expect(markdownVisibleLength(md)).toBe('Activity logs'.length);
  });

  it('handles mixed plain text and links', () => {
    const md =
      'FetchReport • [Activity logs](https://example.test/very/long/url/)';
    const expected = 'FetchReport • Activity logs'.length;
    expect(markdownVisibleLength(md)).toBe(expected);
  });

  it('handles multiple links', () => {
    const md = '[A](http://a.test/) and [B](http://b.test/)';
    expect(markdownVisibleLength(md)).toBe('A and B'.length);
  });
});

describe('truncateMarkdown', () => {
  it('returns the full string when visible text fits within maxLen', () => {
    const md = '[Activity logs](https://example.test/reports/segment/)';
    // visible text "Activity logs" (13 chars) fits in 120
    expect(truncateMarkdown(md, 120)).toBe(md);
  });

  it('preserves the full Markdown when prefix + link label fits', () => {
    const md =
      'FetchReport • [Activity logs](https://example.test/reports/' +
      'segment/'.repeat(16) +
      ')';
    // visible: "FetchReport • Activity logs" = 27 chars, fits in 120
    const result = truncateMarkdown(md, 120);
    expect(result).toBe(md);
    expect(result).toContain('https://');
  });

  it('truncates to plain text when visible text exceeds maxLen', () => {
    const longLabel = 'x'.repeat(130);
    const md = `[${longLabel}](https://example.test/)`;
    const result = truncateMarkdown(md, 120);
    expect(result).toHaveLength(123); // 120 chars + '...'
    expect(result).not.toContain('https://');
    expect(result).not.toContain('](');
    expect(result.endsWith('...')).toBe(true);
  });

  it('does not break a link by slicing inside the URL', () => {
    // Simulates the bug: short label, long URL
    const shortLabel = 'Activity logs';
    const longUrl = 'https://example.test/reports/' + 'segment/'.repeat(16);
    const prefix = 'FetchReport';
    const md = `${prefix} • [${shortLabel}](${longUrl})`;

    // Visible text is 27 chars (fits) so the full markdown is preserved
    const result = truncateMarkdown(md, 120);
    expect(result).toContain(longUrl);
    expect(result).not.toMatch(/\]\([^)]*$/); // no unclosed link syntax
  });

  it('truncates plain text normally when no Markdown links are present', () => {
    const longText = 'a'.repeat(130);
    const result = truncateMarkdown(longText, 120);
    expect(result).toBe('a'.repeat(120) + '...');
  });
});
