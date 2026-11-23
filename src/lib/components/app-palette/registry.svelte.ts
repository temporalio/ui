import { DEV } from 'esm-env';
import { untrack } from 'svelte';

import { duplicateKeys } from './scope';
import type { PaletteToolSet } from './types';

interface Registration {
  toolSet: PaletteToolSet;
}

let registrations = $state.raw<Registration[]>([]);

function warnOnDuplicateKeys() {
  if (!DEV) return;
  const duplicates = duplicateKeys(registeredToolSets());
  if (duplicates.length === 0) return;
  console.warn(
    `Palette: more than one tool set uses the key ${duplicates.join(', ')}. Typing the key scopes to the first set only.`,
  );
}

// Adds a set to the app palette and returns a function that removes it.
// Each call is its own registration. When two registrations share a set id,
// the latest one shows, and removing it shows the one before it again.
// Apps register from effects, so the read of the list is untracked.
// Otherwise the effect would rerun on its own write.
export function registerToolSet(toolSet: PaletteToolSet): () => void {
  const registration: Registration = { toolSet };
  untrack(() => {
    registrations = [...registrations, registration];
    warnOnDuplicateKeys();
  });
  return () =>
    untrack(() => {
      registrations = registrations.filter((entry) => entry !== registration);
    });
}

// One set per id, the latest registration, in the order the ids were
// last registered.
export function registeredToolSets(): readonly PaletteToolSet[] {
  return registrations
    .filter(
      ({ toolSet }, index) =>
        registrations.findLastIndex(
          (entry) => entry.toolSet.id === toolSet.id,
        ) === index,
    )
    .map(({ toolSet }) => toolSet);
}
