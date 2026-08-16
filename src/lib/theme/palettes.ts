export const paletteNames = ['precision', 'ember', 'vaporwave'] as const;

export type PaletteName = (typeof paletteNames)[number];

export const defaultPalette = 'precision' satisfies PaletteName;

type PaletteMetadata = Readonly<{
  labelKey: `common.${string}`;
  ariaLabelKey: `common.${string}`;
}>;

export const paletteMetadata = {
  precision: {
    labelKey: 'common.precision',
    ariaLabelKey: 'common.precision-palette',
  },
  ember: {
    labelKey: 'common.ember',
    ariaLabelKey: 'common.ember-palette',
  },
  vaporwave: {
    labelKey: 'common.vaporwave',
    ariaLabelKey: 'common.vaporwave-palette',
  },
} as const satisfies Readonly<Record<PaletteName, PaletteMetadata>>;

export const isPaletteName = (value: unknown): value is PaletteName =>
  typeof value === 'string' && paletteNames.includes(value as PaletteName);
