import { untrack } from 'svelte';

import type { PaletteToolSet } from './types';

let toolSets = $state.raw<PaletteToolSet[]>([]);

// Adds a set to the app palette and returns a function that removes it.
// A set with the same id replaces the one before it. Apps register from
// effects, so the read of the list is untracked. Otherwise the effect would
// rerun on its own write.
export function registerToolSet(toolSet: PaletteToolSet): () => void {
  untrack(() => {
    toolSets = [...toolSets.filter(({ id }) => id !== toolSet.id), toolSet];
  });
  return () =>
    untrack(() => {
      toolSets = toolSets.filter((registered) => registered !== toolSet);
    });
}

export function registeredToolSets(): readonly PaletteToolSet[] {
  return toolSets;
}
