import {
  DEFAULT_SHORTCUT,
  loadShortcutSetting,
  type PaletteShortcut,
  type PaletteShortcutSetting,
  saveShortcutSetting,
  shortcutLabel,
} from './keys';
import { visibleToolSets } from './rules';
import type { PaletteFacts } from './types';

import { registeredToolSets } from './registry.svelte';

const SHORTCUT_STORAGE_KEY = 'palette-shortcut';

// Set `open` to open the app palette from a button or a menu. The mounted
// AppPalette sets `facts` and `appShortcut`. Show a menu item that opens the
// palette only when `available` is true, so the item and the palette never
// disagree. Show `shortcutLabel` next to it, so the hint matches the key.
class AppPaletteState {
  open = $state(false);
  facts = $state.raw<PaletteFacts>();
  // The app's shortcut. A user's own choice replaces it.
  appShortcut = $state.raw<PaletteShortcut>(DEFAULT_SHORTCUT);
  userShortcut = $state.raw<PaletteShortcutSetting | undefined>(
    loadShortcutSetting(SHORTCUT_STORAGE_KEY),
  );

  get available(): boolean {
    if (!this.facts) return false;
    return visibleToolSets(registeredToolSets(), this.facts).length > 0;
  }

  // Null when the user turned the shortcut off.
  get shortcut(): PaletteShortcut | null {
    if (this.userShortcut === 'off') return null;
    return this.userShortcut ?? this.appShortcut;
  }

  get shortcutLabel(): string | undefined {
    return this.shortcut ? shortcutLabel(this.shortcut) : undefined;
  }

  // Saves the user's choice. Undefined goes back to the app's shortcut.
  setUserShortcut(setting: PaletteShortcutSetting | undefined): void {
    this.userShortcut = setting;
    saveShortcutSetting(SHORTCUT_STORAGE_KEY, setting);
  }
}

export const appPalette = new AppPaletteState();
