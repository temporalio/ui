import type { PaletteItem } from './types';

const TITLE_PREFIX = 3;
const TITLE_WORD_PREFIX = 2;
const ANYWHERE = 1;

function scoreToken(item: PaletteItem, token: string): number {
  const title = item.title.toLowerCase();
  if (title.startsWith(token)) return TITLE_PREFIX;
  if (title.split(/[\s_\-/]+/).some((word) => word.startsWith(token))) {
    return TITLE_WORD_PREFIX;
  }

  const haystack = [title, item.subtitle ?? '', ...(item.keywords ?? [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(token) ? ANYWHERE : 0;
}

// Keeps items that match every word of the query and sorts the best matches
// first. A title prefix beats a word prefix, which beats a match anywhere in
// the title, subtitle, or keywords. `boost` adds to the score of a match,
// for example for recent use. Ties keep their original order.
export function filterPaletteItems(
  items: readonly PaletteItem[],
  query: string,
  boost: (item: PaletteItem) => number = () => 0,
): PaletteItem[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [...items];

  return items
    .map((item, index) => {
      const scores = tokens.map((token) => scoreToken(item, token));
      const matched = scores.every((score) => score > 0);
      const score =
        scores.reduce((sum, value) => sum + value, 0) +
        (matched ? boost(item) : 0);
      return { item, index, matched, score };
    })
    .filter(({ matched }) => matched)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}
