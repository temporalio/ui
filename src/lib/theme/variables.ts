import { type PaletteName, paletteNames } from './palettes';
import { toColor } from './utilities';

const eventCategoryVariables = {
  '--color-event-category-workflow': {
    light: 'blue.700',
    dark: 'blue.300',
  },
  '--color-event-category-activity': {
    light: 'purple.700',
    dark: 'purple.300',
  },
  '--color-event-category-child-workflow': {
    light: 'cyan.700',
    dark: 'cyan.300',
  },
  '--color-event-category-timer': {
    light: 'yellow.700',
    dark: 'yellow.200',
  },
  '--color-event-category-signal': {
    light: 'pink.700',
    dark: 'pink.300',
  },
  '--color-event-category-update': {
    light: 'green.700',
    dark: 'green.300',
  },
  '--color-event-category-nexus': {
    light: 'indigo.700',
    dark: 'indigo.300',
  },
  '--color-event-category-local-activity': {
    light: 'orange.900',
    dark: 'orange.400',
  },
  '--color-event-category-other': {
    light: 'slate.600',
    dark: 'slate.300',
  },
} as const satisfies ColorVariables;

const precisionVariables = {
  ...eventCategoryVariables,
  // Text
  '--color-text-black': {
    light: 'space-black',
    dark: 'space-black',
  },
  '--color-text-white': {
    light: 'off-white',
    dark: 'off-white',
  },
  '--color-text-primary': {
    light: 'space-black',
    dark: 'off-white',
  },
  '--color-text-secondary': {
    light: 'slate.600',
    dark: 'slate.300',
  },
  '--color-text-inverse': {
    light: 'off-white',
    dark: 'space-black',
  },
  '--color-text-subtle': {
    light: 'slate.600',
    dark: 'slate.400',
  },
  '--color-text-danger': {
    light: 'red.700',
    dark: 'red.300',
  },
  '--color-text-information': {
    light: 'indigo.700',
    dark: 'indigo.300',
  },
  '--color-text-success': {
    light: 'green.700',
    dark: 'green.300',
  },
  '--color-text-warning': {
    light: 'yellow.800',
    dark: 'yellow.300',
  },
  '--color-text-pink': {
    light: 'pink.800',
    dark: 'pink.400',
  },
  '--color-text-brand': {
    light: 'indigo.600',
    dark: 'indigo.300',
  },
  // Surface
  '--color-surface-background': {
    light: 'off-white',
    dark: 'space-black',
  },
  '--color-surface-primary': {
    light: 'white',
    dark: 'black',
  },
  '--color-surface-secondary': {
    light: 'slate.50',
    dark: 'off-black',
  },
  '--color-surface-subtle': {
    light: 'slate.100',
    dark: 'slate.800',
  },
  '--color-surface-table': {
    light: 'space-black',
    dark: 'slate.900',
  },
  '--color-surface-table-header': {
    light: 'slate.50',
    dark: 'slate.800',
  },
  '--color-surface-success': {
    light: 'green.50',
    dark: 'green.950',
  },
  '--color-surface-success-loud': {
    light: 'green.600',
    dark: 'green.600',
  },
  '--color-surface-information': {
    light: 'indigo.50',
    dark: 'indigo.950',
  },
  '--color-surface-information-loud': {
    light: 'indigo.600',
    dark: 'indigo.600',
  },
  '--color-surface-danger': {
    light: 'red.50',
    dark: 'red.950',
  },
  '--color-surface-warning': {
    light: 'yellow.50',
    dark: 'yellow.950',
  },
  '--color-surface-brand': {
    light: 'indigo.600',
    dark: 'indigo.400',
  },
  '--color-workflow-relationship-connector': {
    light: 'slate.500',
    dark: 'slate.500',
  },
  '--color-workflow-relationship-current': {
    light: 'indigo.200',
    dark: 'indigo.800',
  },
  '--color-workflow-relationship-placeholder': {
    light: 'white',
    dark: 'space-black',
  },
  '--color-surface-inverse': {
    light: 'space-black',
    dark: 'off-white',
  },
  '--color-surface-black': {
    light: 'space-black',
    dark: 'space-black',
  },
  '--color-surface-code-block': {
    light: 'slate.50',
    dark: 'code-black',
  },
  // Interactive
  '--color-interactive-surface': {
    light: 'indigo.600',
    dark: 'indigo.600',
  },
  '--color-interactive-hover': {
    light: 'indigo.700',
    dark: 'indigo.700',
  },
  '--color-interactive-active': {
    light: 'indigo.800',
    dark: 'indigo.900',
  },
  '--color-interactive-secondary-surface': {
    light: 'white',
    dark: 'off-black',
  },
  '--color-interactive-secondary-hover': {
    light: 'slate.50',
    dark: 'slate.900',
  },
  '--color-interactive-secondary-active': {
    light: 'slate.200',
    dark: 'slate.800',
  },
  '--color-interactive-danger-surface': {
    light: 'red.700',
    dark: 'red.700',
  },
  '--color-interactive-danger-hover': {
    light: 'red.800',
    dark: 'red.800',
  },
  '--color-interactive-danger-active': {
    light: 'red.900',
    dark: 'red.900',
  },
  '--color-interactive-ghost-hover': {
    light: 'slate.100',
    dark: 'slate.700',
  },
  '--color-interactive-ghost-active': {
    light: 'slate.100',
    dark: 'slate.950',
  },
  '--color-interactive-table-hover': {
    light: 'indigo.50',
    dark: 'slate.800',
  },
  '--color-surface-table-related-hover': {
    light: 'indigo.50',
    dark: 'slate.800',
  },
  // Border
  '--color-border-primary': {
    light: 'slate.500',
    dark: 'slate.500',
  },
  '--color-border-secondary': {
    light: 'slate.300',
    dark: 'slate.700',
  },
  '--color-border-subtle': {
    light: 'slate.200',
    dark: 'slate.800',
  },
  '--color-border-table': {
    light: 'slate.300',
    dark: 'slate.700',
  },
  '--color-border-inverse': {
    light: 'off-white',
    dark: 'slate.900',
  },
  '--color-border-information': {
    light: 'indigo.500',
    dark: 'indigo.400',
  },
  '--color-border-success': {
    light: 'green.600',
    dark: 'green.400',
  },
  '--color-border-warning': {
    light: 'yellow.600',
    dark: 'yellow.400',
  },
  '--color-border-danger': {
    light: 'red.500',
    dark: 'red.400',
  },
  '--color-border-focus-info': {
    light: 'indigo.600',
    dark: 'indigo.300',
  },
  '--color-border-focus-danger': {
    light: 'red.600',
    dark: 'red.600',
  },
  // Effects
  '--color-shadow': {
    light: 'space-black',
    dark: 'space-black',
  },
} as const satisfies ColorVariables;

export type Variable = keyof typeof precisionVariables;

type PaletteVariables = Readonly<Record<Variable, ColorVariableValue>>;
type ResolvedPaletteVariables = Record<Variable, RGB>;
type ResolvedPalette = Readonly<Record<ColorScheme, ResolvedPaletteVariables>>;
type ResolvedPaletteRegistry = Readonly<Record<PaletteName, ResolvedPalette>>;

const emberVariables = {
  ...eventCategoryVariables,
  // Text
  '--color-text-black': {
    light: 'stone.950',
    dark: 'stone.950',
  },
  '--color-text-white': {
    light: 'stone.50',
    dark: 'stone.50',
  },
  '--color-text-primary': {
    light: 'stone.950',
    dark: 'stone.50',
  },
  '--color-text-secondary': {
    light: 'stone.600',
    dark: 'stone.200',
  },
  '--color-text-inverse': {
    light: 'stone.50',
    dark: 'stone.950',
  },
  '--color-text-subtle': {
    light: 'stone.600',
    dark: 'stone.300',
  },
  '--color-text-danger': {
    light: 'red.700',
    dark: 'red.300',
  },
  '--color-text-information': {
    light: 'cyan.700',
    dark: 'cyan.300',
  },
  '--color-text-success': {
    light: 'green.700',
    dark: 'green.300',
  },
  '--color-text-warning': {
    light: 'yellow.800',
    dark: 'yellow.300',
  },
  '--color-text-pink': {
    light: 'pink.800',
    dark: 'pink.400',
  },
  '--color-text-brand': {
    light: 'orange.800',
    dark: 'orange.300',
  },
  // Surface
  '--color-surface-background': {
    light: 'stone.100',
    dark: 'stone.950',
  },
  '--color-surface-primary': {
    light: 'stone.50',
    dark: 'stone.900',
  },
  '--color-surface-secondary': {
    light: 'stone.100',
    dark: 'stone.800',
  },
  '--color-surface-subtle': {
    light: 'stone.200',
    dark: 'stone.700',
  },
  '--color-surface-table': {
    light: 'stone.950',
    dark: 'stone.900',
  },
  '--color-surface-table-header': {
    light: 'stone.100',
    dark: 'stone.800',
  },
  '--color-surface-success': {
    light: 'green.50',
    dark: 'green.950',
  },
  '--color-surface-success-loud': {
    light: 'green.700',
    dark: 'green.700',
  },
  '--color-surface-information': {
    light: 'cyan.50',
    dark: 'cyan.950',
  },
  '--color-surface-information-loud': {
    light: 'cyan.700',
    dark: 'cyan.700',
  },
  '--color-surface-danger': {
    light: 'red.50',
    dark: 'red.950',
  },
  '--color-surface-warning': {
    light: 'yellow.50',
    dark: 'yellow.950',
  },
  '--color-surface-brand': {
    light: 'orange.800',
    dark: 'orange.800',
  },
  '--color-workflow-relationship-connector': {
    light: 'stone.500',
    dark: 'stone.500',
  },
  '--color-workflow-relationship-current': {
    light: 'orange.200',
    dark: 'orange.800',
  },
  '--color-workflow-relationship-placeholder': {
    light: 'stone.50',
    dark: 'stone.950',
  },
  '--color-surface-inverse': {
    light: 'stone.950',
    dark: 'stone.50',
  },
  '--color-surface-black': {
    light: 'stone.950',
    dark: 'stone.950',
  },
  '--color-surface-code-block': {
    light: 'stone.100',
    dark: 'stone.950',
  },
  // Interactive
  '--color-interactive-surface': {
    light: 'orange.800',
    dark: 'orange.800',
  },
  '--color-interactive-hover': {
    light: 'orange.900',
    dark: 'orange.900',
  },
  '--color-interactive-active': {
    light: 'orange.950',
    dark: 'orange.950',
  },
  '--color-interactive-secondary-surface': {
    light: 'stone.50',
    dark: 'stone.900',
  },
  '--color-interactive-secondary-hover': {
    light: 'stone.100',
    dark: 'stone.800',
  },
  '--color-interactive-secondary-active': {
    light: 'stone.200',
    dark: 'stone.700',
  },
  '--color-interactive-danger-surface': {
    light: 'red.700',
    dark: 'red.700',
  },
  '--color-interactive-danger-hover': {
    light: 'red.800',
    dark: 'red.800',
  },
  '--color-interactive-danger-active': {
    light: 'red.900',
    dark: 'red.900',
  },
  '--color-interactive-ghost-hover': {
    light: 'stone.200',
    dark: 'stone.700',
  },
  '--color-interactive-ghost-active': {
    light: 'stone.300',
    dark: 'stone.950',
  },
  '--color-interactive-table-hover': {
    light: 'orange.50',
    dark: 'stone.800',
  },
  '--color-surface-table-related-hover': {
    light: 'orange.50',
    dark: 'stone.800',
  },
  // Border
  '--color-border-primary': {
    light: 'stone.500',
    dark: 'stone.500',
  },
  '--color-border-secondary': {
    light: 'stone.300',
    dark: 'stone.600',
  },
  '--color-border-subtle': {
    light: 'stone.200',
    dark: 'stone.700',
  },
  '--color-border-table': {
    light: 'stone.300',
    dark: 'stone.600',
  },
  '--color-border-inverse': {
    light: 'stone.50',
    dark: 'stone.900',
  },
  '--color-border-information': {
    light: 'cyan.600',
    dark: 'cyan.400',
  },
  '--color-border-success': {
    light: 'green.600',
    dark: 'green.400',
  },
  '--color-border-warning': {
    light: 'yellow.600',
    dark: 'yellow.400',
  },
  '--color-border-danger': {
    light: 'red.500',
    dark: 'red.400',
  },
  '--color-border-focus-info': {
    light: 'orange.700',
    dark: 'orange.400',
  },
  '--color-border-focus-danger': {
    light: 'red.600',
    dark: 'red.600',
  },
  // Effects
  '--color-shadow': {
    light: 'stone.950',
    dark: 'stone.950',
  },
} as const satisfies PaletteVariables;

const vaporwaveVariables = {
  ...eventCategoryVariables,
  // Text
  '--color-text-black': {
    light: 'violet-neutral.950',
    dark: 'violet-neutral.950',
  },
  '--color-text-white': {
    light: 'violet-neutral.50',
    dark: 'violet-neutral.50',
  },
  '--color-text-primary': {
    light: 'violet-neutral.950',
    dark: 'violet-neutral.50',
  },
  '--color-text-secondary': {
    light: 'violet-neutral.600',
    dark: 'violet-neutral.200',
  },
  '--color-text-inverse': {
    light: 'violet-neutral.50',
    dark: 'violet-neutral.950',
  },
  '--color-text-subtle': {
    light: 'violet-neutral.600',
    dark: 'violet-neutral.300',
  },
  '--color-text-danger': {
    light: 'red.700',
    dark: 'red.300',
  },
  '--color-text-information': {
    light: 'cyan.700',
    dark: 'cyan.300',
  },
  '--color-text-success': {
    light: 'green.700',
    dark: 'green.300',
  },
  '--color-text-warning': {
    light: 'yellow.800',
    dark: 'yellow.300',
  },
  '--color-text-pink': {
    light: 'pink.800',
    dark: 'pink.300',
  },
  '--color-text-brand': {
    light: 'pink.800',
    dark: 'pink.300',
  },
  // Surface
  '--color-surface-background': {
    light: 'violet-neutral.100',
    dark: 'violet-neutral.950',
  },
  '--color-surface-primary': {
    light: 'violet-neutral.50',
    dark: 'violet-neutral.900',
  },
  '--color-surface-secondary': {
    light: 'violet-neutral.100',
    dark: 'violet-neutral.800',
  },
  '--color-surface-subtle': {
    light: 'violet-neutral.200',
    dark: 'violet-neutral.700',
  },
  '--color-surface-table': {
    light: 'violet-neutral.950',
    dark: 'violet-neutral.900',
  },
  '--color-surface-table-header': {
    light: 'violet-neutral.100',
    dark: 'violet-neutral.800',
  },
  '--color-surface-success': {
    light: 'green.50',
    dark: 'green.950',
  },
  '--color-surface-success-loud': {
    light: 'green.700',
    dark: 'green.700',
  },
  '--color-surface-information': {
    light: 'cyan.50',
    dark: 'cyan.950',
  },
  '--color-surface-information-loud': {
    light: 'cyan.700',
    dark: 'cyan.700',
  },
  '--color-surface-danger': {
    light: 'red.50',
    dark: 'red.950',
  },
  '--color-surface-warning': {
    light: 'yellow.50',
    dark: 'yellow.950',
  },
  '--color-surface-brand': {
    light: 'pink.800',
    dark: 'pink.800',
  },
  '--color-workflow-relationship-connector': {
    light: 'violet-neutral.500',
    dark: 'violet-neutral.500',
  },
  '--color-workflow-relationship-current': {
    light: 'cyan.200',
    dark: 'cyan.800',
  },
  '--color-workflow-relationship-placeholder': {
    light: 'violet-neutral.50',
    dark: 'violet-neutral.950',
  },
  '--color-surface-inverse': {
    light: 'violet-neutral.950',
    dark: 'violet-neutral.50',
  },
  '--color-surface-black': {
    light: 'violet-neutral.950',
    dark: 'violet-neutral.950',
  },
  '--color-surface-code-block': {
    light: 'violet-neutral.100',
    dark: 'violet-neutral.950',
  },
  // Interactive
  '--color-interactive-surface': {
    light: 'pink.800',
    dark: 'pink.800',
  },
  '--color-interactive-hover': {
    light: 'pink.900',
    dark: 'pink.900',
  },
  '--color-interactive-active': {
    light: 'pink.950',
    dark: 'pink.950',
  },
  '--color-interactive-secondary-surface': {
    light: 'violet-neutral.50',
    dark: 'violet-neutral.900',
  },
  '--color-interactive-secondary-hover': {
    light: 'violet-neutral.100',
    dark: 'violet-neutral.800',
  },
  '--color-interactive-secondary-active': {
    light: 'violet-neutral.200',
    dark: 'violet-neutral.700',
  },
  '--color-interactive-danger-surface': {
    light: 'red.700',
    dark: 'red.700',
  },
  '--color-interactive-danger-hover': {
    light: 'red.800',
    dark: 'red.800',
  },
  '--color-interactive-danger-active': {
    light: 'red.900',
    dark: 'red.900',
  },
  '--color-interactive-ghost-hover': {
    light: 'violet-neutral.200',
    dark: 'violet-neutral.700',
  },
  '--color-interactive-ghost-active': {
    light: 'violet-neutral.300',
    dark: 'violet-neutral.950',
  },
  '--color-interactive-table-hover': {
    light: 'pink.50',
    dark: 'violet-neutral.800',
  },
  '--color-surface-table-related-hover': {
    light: 'cyan.50',
    dark: 'violet-neutral.800',
  },
  // Border
  '--color-border-primary': {
    light: 'violet-neutral.500',
    dark: 'violet-neutral.500',
  },
  '--color-border-secondary': {
    light: 'violet-neutral.300',
    dark: 'violet-neutral.600',
  },
  '--color-border-subtle': {
    light: 'violet-neutral.200',
    dark: 'violet-neutral.700',
  },
  '--color-border-table': {
    light: 'violet-neutral.300',
    dark: 'violet-neutral.600',
  },
  '--color-border-inverse': {
    light: 'violet-neutral.50',
    dark: 'violet-neutral.900',
  },
  '--color-border-information': {
    light: 'cyan.600',
    dark: 'cyan.400',
  },
  '--color-border-success': {
    light: 'green.600',
    dark: 'green.400',
  },
  '--color-border-warning': {
    light: 'yellow.600',
    dark: 'yellow.400',
  },
  '--color-border-danger': {
    light: 'red.500',
    dark: 'red.400',
  },
  '--color-border-focus-info': {
    light: 'pink.700',
    dark: 'pink.400',
  },
  '--color-border-focus-danger': {
    light: 'red.600',
    dark: 'red.600',
  },
  // Effects
  '--color-shadow': {
    light: 'violet-neutral.950',
    dark: 'violet-neutral.950',
  },
} as const satisfies PaletteVariables;

export const paletteVariables = {
  precision: precisionVariables,
  ember: emberVariables,
  vaporwave: vaporwaveVariables,
} as const satisfies Readonly<Record<PaletteName, PaletteVariables>>;

const resolvePalette = (
  palette: PaletteVariables,
  scheme: ColorScheme,
): ResolvedPaletteVariables => {
  const resolved = {} as ResolvedPaletteVariables;

  for (const variable of Object.keys(palette) as Variable[]) {
    resolved[variable] = toColor(palette[variable][scheme]);
  }

  return resolved;
};

const resolvePaletteRegistry = (): ResolvedPaletteRegistry => {
  const resolved = {} as Record<PaletteName, ResolvedPalette>;

  for (const palette of paletteNames) {
    resolved[palette] = {
      light: resolvePalette(paletteVariables[palette], 'light'),
      dark: resolvePalette(paletteVariables[palette], 'dark'),
    };
  }

  return resolved;
};

export const paletteCSSVariables = resolvePaletteRegistry();

// Preserve the original exports for consumers that rely on the default palette.
export const variables = paletteVariables.precision;
export const light = paletteCSSVariables.precision.light;
export const dark = paletteCSSVariables.precision.dark;
