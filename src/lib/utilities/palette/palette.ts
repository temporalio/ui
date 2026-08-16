import { persistStore } from '$lib/stores/persist-store';
import {
  defaultPalette,
  isPaletteName,
  type PaletteName,
} from '$lib/theme/palettes';

export const palettePreferenceKey = 'color palette';

export const usePalettePreference = persistStore<PaletteName>(
  palettePreferenceKey,
  defaultPalette,
  true,
);

const applyPalette = (node: HTMLElement, value: PaletteName) => {
  node.dataset.palette = value;
  document.documentElement.dataset.palette = value;
  document.body.dataset.palette = value;
};

export const palette = (node: HTMLElement) => {
  const unsubscribe = usePalettePreference.subscribe((value) => {
    if (!isPaletteName(value)) {
      usePalettePreference.set(defaultPalette);
      return;
    }

    applyPalette(node, value);
  });

  return { destroy: unsubscribe };
};
