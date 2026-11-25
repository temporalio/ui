/**
 * Returns the visible (plain-text) length of a Markdown string by replacing
 * inline links `[text](url)` with their display text. This avoids counting
 * URL characters when deciding whether to truncate, so a short label with a
 * long destination URL is never cut mid-link.
 */
export const markdownVisibleLength = (md: string): number =>
  md.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').length;

/**
 * Truncate `text` to at most `maxLen` visible characters. If `text` contains
 * Markdown inline links and the visible text fits within the limit, the full
 * Markdown string (including the URL) is returned unchanged so links remain
 * clickable. When the visible text itself exceeds the limit the string is
 * reduced to plain text and truncated, which is safer than slicing raw
 * Markdown mid-link.
 */
export const truncateMarkdown = (text: string, maxLen: number): string => {
  const plain = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  if (plain.length <= maxLen) return text;
  return plain.slice(0, maxLen) + '...';
};
