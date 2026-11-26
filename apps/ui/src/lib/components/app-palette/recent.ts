export interface RecentUse {
  id: string;
  at: number;
}

const MAX_RECENT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;
// Less than the gap between two text match tiers, so a strong text match
// always beats a weak recent match.
const MAX_BOOST = 0.9;

// Moves the item to the front and keeps the list short.
export function recordUse(
  recent: readonly RecentUse[],
  id: string,
  now: number,
): RecentUse[] {
  return [{ id, at: now }, ...recent.filter((use) => use.id !== id)].slice(
    0,
    MAX_RECENT,
  );
}

// A score bonus that fades over a week. Items never used get 0.
export function recencyBoost(
  recent: readonly RecentUse[],
  id: string,
  now: number,
): number {
  const use = recent.find((entry) => entry.id === id);
  if (!use) return 0;
  const ageDays = Math.max(now - use.at, 0) / DAY_MS;
  return MAX_BOOST * Math.max(1 - ageDays / 7, 0.1);
}

function isRecentUse(value: unknown): value is RecentUse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'at' in value &&
    typeof value.id === 'string' &&
    typeof value.at === 'number'
  );
}

// Storage can be missing or blocked (private windows, blocked site data), so
// every access is guarded and the palette works without it.
export function loadRecent(key: string): RecentUse[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRecentUse) : [];
  } catch {
    return [];
  }
}

export function saveRecent(key: string, recent: readonly RecentUse[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(recent));
  } catch {
    // Recency is a convenience. Without storage it resets on reload.
  }
}
