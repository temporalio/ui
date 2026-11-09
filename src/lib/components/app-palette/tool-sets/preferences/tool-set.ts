import type {
  PaletteRules,
  PaletteToolSet,
} from '$lib/components/app-palette/types';
import { translate } from '$lib/i18n/translate';

import { paletteShortcutTool } from '../../shortcut-tool';

import themeTool from './theme.svelte';
import timeTool from './time.svelte';

export interface PreferencesToolSetOptions {
  rules?: PaletteRules;
}

// The user's display preferences: theme, time and the palette shortcut.
export function preferencesToolSet({
  rules,
}: PreferencesToolSetOptions = {}): PaletteToolSet {
  return {
    id: 'preferences',
    get label() {
      return translate('palette-preferences.label');
    },
    key: 'p',
    order: 40,
    rules,
    tools: [themeTool, timeTool, paletteShortcutTool],
  };
}
