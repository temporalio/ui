import type { PaletteToolSet } from './types';

let toolSets = $state.raw<PaletteToolSet[]>([]);

// Adds a set to the app palette and returns a function that removes it.
// A set with the same id replaces the one before it.
export function registerToolSet(toolSet: PaletteToolSet): () => void {
  toolSets = [...toolSets.filter(({ id }) => id !== toolSet.id), toolSet];
  return () => {
    toolSets = toolSets.filter((registered) => registered !== toolSet);
  };
}

export function registeredToolSets(): readonly PaletteToolSet[] {
  return toolSets;
}
