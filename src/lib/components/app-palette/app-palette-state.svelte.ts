import { visibleToolSets } from './rules';
import type { PaletteFacts } from './types';

import { registeredToolSets } from './registry.svelte';

// Set `open` to open the app palette from a button or a menu. The mounted
// AppPalette sets `facts`. Show a menu item that opens the palette only when
// `available` is true, so the item and the palette never disagree.
class AppPaletteState {
  open = $state(false);
  facts = $state.raw<PaletteFacts>();

  get available(): boolean {
    if (!this.facts) return false;
    return visibleToolSets(registeredToolSets(), this.facts).length > 0;
  }
}

export const appPalette = new AppPaletteState();
