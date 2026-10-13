import type { PaletteToolSet } from './types';

// Set ids in the order Tab visits them. `null` is All.
function scopeCycle(toolSets: readonly PaletteToolSet[]): (string | null)[] {
  return [null, ...toolSets.map(({ id }) => id)];
}

// The set whose key matches a one-letter query, if any.
export function setForKey(
  toolSets: readonly PaletteToolSet[],
  query: string,
): PaletteToolSet | undefined {
  const key = query.toLowerCase();
  return toolSets.find((toolSet) => toolSet.key === key);
}

// Moves the scope by `delta` steps, wrapping around through All.
export function nextScope(
  toolSets: readonly PaletteToolSet[],
  scope: string | null,
  delta: number,
): string | null {
  const cycle = scopeCycle(toolSets);
  const index = Math.max(cycle.indexOf(scope), 0);
  return cycle[(index + delta + cycle.length) % cycle.length];
}

// The sets the palette shows for a scope. A scope whose set is no longer
// visible falls back to All.
export function scopedToolSets(
  toolSets: readonly PaletteToolSet[],
  scope: string | null,
): PaletteToolSet[] {
  const scoped = toolSets.filter(({ id }) => id === scope);
  return scoped.length > 0 ? scoped : [...toolSets];
}

// Keys that more than one set uses. The registry test keeps this empty.
export function duplicateKeys(toolSets: readonly PaletteToolSet[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { key } of toolSets) {
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return [...duplicates];
}
