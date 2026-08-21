import { colorAlphaScales } from './color-alpha-scales';
import { colorScales } from './color-scales';
import type { HexColor } from './types';

export type SemanticColor = Readonly<{
  light: string;
  dark: string;
}>;

type OpaqueSemanticColor = Readonly<{
  light: HexColor;
  dark: HexColor;
}>;

type BackgroundColors = Readonly<{
  primary: SemanticColor;
}>;

type ContentColors = Readonly<{
  primary: SemanticColor;
  secondary: SemanticColor;
  tertiary: SemanticColor;
  'code-block': SemanticColor;
  'code-block-accent': SemanticColor;
  brand: SemanticColor;
  information: SemanticColor;
  success: SemanticColor;
  warning: SemanticColor;
  danger: SemanticColor;
  error: SemanticColor;
  'inverse-secondary': SemanticColor;
  'inverse-primary': SemanticColor;
  black: SemanticColor;
  white: SemanticColor;
}>;

type SurfaceStatusColors = Readonly<{
  blue: SemanticColor;
  green: SemanticColor;
  red: SemanticColor;
  persimmon: SemanticColor;
  amber: SemanticColor;
  neutral: SemanticColor;
}>;

type SurfaceColors = Readonly<{
  primary: SemanticColor;
  secondary: SemanticColor;
  tertiary: SemanticColor;
  'table-header': SemanticColor;
  'code-block': SemanticColor;
  brand: SemanticColor;
  information: SemanticColor;
  success: SemanticColor;
  warning: SemanticColor;
  danger: SemanticColor;
  error: SemanticColor;
  status: SurfaceStatusColors;
}>;

type BorderColors = Readonly<{
  primary: SemanticColor;
  secondary: SemanticColor;
  tertiary: SemanticColor;
  brand: SemanticColor;
  information: SemanticColor;
  success: SemanticColor;
  warning: SemanticColor;
  danger: SemanticColor;
  error: SemanticColor;
}>;

type InteractiveColors = Readonly<{
  primary: SemanticColor;
  'primary-hover': SemanticColor;
  'primary-press': SemanticColor;
  secondary: SemanticColor;
  'secondary-hover': SemanticColor;
  'secondary-press': SemanticColor;
  danger: SemanticColor;
  'danger-hover': SemanticColor;
  'danger-press': SemanticColor;
}>;

type ActionColors = Readonly<{
  'hover-overlay': SemanticColor;
  'press-overlay': SemanticColor;
  'brand-hover': SemanticColor;
}>;

type OverlayColors = Readonly<{
  backdrop: SemanticColor;
}>;

type SemanticColors = Readonly<{
  background: BackgroundColors;
  content: ContentColors;
  surface: SurfaceColors;
  border: BorderColors;
  interactive: InteractiveColors;
  actions: ActionColors;
  overlay: OverlayColors;
}>;

const surfacePrimary: OpaqueSemanticColor = {
  light: '#f8f8f8',
  dark: '#121212',
};

const backgroundPrimary = surfacePrimary;

const interactivePrimary: OpaqueSemanticColor = {
  light: colorScales.indigo[9],
  dark: colorScales.indigo[10],
};

const interactiveSecondary = surfacePrimary;

export const semanticColors: SemanticColors = {
  background: {
    primary: backgroundPrimary,
  },
  content: {
    primary: {
      light: colorScales.slate[12],
      dark: colorScales.slate[1],
    },
    secondary: {
      light: colorScales.slate[10],
      dark: colorScales.slate[6],
    },
    tertiary: {
      light: colorScales.slate[8],
      dark: colorScales.neutral[4],
    },
    'code-block': {
      light: colorScales.slate[12],
      dark: colorScales.slate[1],
    },
    'code-block-accent': {
      light: colorScales['dark-magenta'][9],
      dark: colorScales['dark-magenta'][8],
    },
    brand: {
      light: colorScales.indigo[9],
      dark: colorScales.indigo[8],
    },
    information: {
      light: colorScales.blue[12],
      dark: colorScales.blue[7],
    },
    success: {
      light: colorScales.green[12],
      dark: colorScales.green[7],
    },
    warning: {
      light: colorScales.amber[12],
      dark: colorScales.amber[7],
    },
    danger: {
      light: colorScales.red[12],
      dark: colorScales.red[7],
    },
    error: {
      light: colorScales.persimmon[12],
      dark: colorScales.persimmon[7],
    },
    'inverse-secondary': {
      light: colorScales.slate[6],
      dark: colorScales.slate[6],
    },
    'inverse-primary': {
      light: colorScales.slate[1],
      dark: colorScales.slate[12],
    },
    black: {
      light: '#000000',
      dark: '#000000',
    },
    white: {
      light: '#ffffff',
      dark: '#ffffff',
    },
  },
  surface: {
    primary: surfacePrimary,
    secondary: {
      light: colorScales.slate[2],
      dark: colorScales.neutral[11],
    },
    tertiary: {
      light: colorScales.slate[3],
      dark: colorScales.neutral[10],
    },
    'table-header': {
      light: colorScales.slate[3],
      dark: colorScales.neutral[9],
    },
    'code-block': {
      light: colorScales.slate[2],
      dark: colorScales.neutral[10],
    },
    brand: {
      light: colorScales.indigo[3],
      dark: colorScales.indigo[12],
    },
    information: {
      light: colorScales.blue[3],
      dark: colorScales.blue[12],
    },
    success: {
      light: colorScales.green[3],
      dark: colorScales.green[12],
    },
    warning: {
      light: colorScales.amber[3],
      dark: colorScales.amber[12],
    },
    danger: {
      light: colorScales.red[3],
      dark: colorScales.red[12],
    },
    error: {
      light: colorScales.persimmon[3],
      dark: colorScales.persimmon[12],
    },
    status: {
      blue: {
        light: colorScales.blue[3],
        dark: colorScales.blue[12],
      },
      green: {
        light: colorScales.green[3],
        dark: colorScales.green[12],
      },
      red: {
        light: colorScales.red[3],
        dark: colorScales.red[12],
      },
      persimmon: {
        light: colorScales.persimmon[3],
        dark: colorScales.persimmon[12],
      },
      amber: {
        light: colorScales.amber[3],
        dark: colorScales.amber[12],
      },
      neutral: {
        light: colorScales.slate[3],
        dark: colorScales.neutral[9],
      },
    },
  },
  border: {
    primary: {
      light: colorAlphaScales.slate[20],
      dark: colorAlphaScales.slate[20],
    },
    secondary: {
      light: colorAlphaScales.slate[40],
      dark: colorAlphaScales.slate[40],
    },
    tertiary: {
      light: colorAlphaScales.slate[60],
      dark: colorAlphaScales.slate[60],
    },
    brand: {
      light: colorAlphaScales.indigo[60],
      dark: colorAlphaScales.indigo[60],
    },
    information: {
      light: colorAlphaScales.blue[60],
      dark: colorAlphaScales.blue[60],
    },
    success: {
      light: colorAlphaScales.green[60],
      dark: colorAlphaScales.green[60],
    },
    warning: {
      light: colorAlphaScales.amber[60],
      dark: colorAlphaScales.amber[60],
    },
    danger: {
      light: colorAlphaScales.red[60],
      dark: colorAlphaScales.red[60],
    },
    error: {
      light: colorAlphaScales.persimmon[60],
      dark: colorAlphaScales.persimmon[60],
    },
  },
  interactive: {
    primary: interactivePrimary,
    'primary-hover': {
      light: colorScales.indigo[10],
      dark: colorScales.indigo[9],
    },
    'primary-press': {
      light: colorScales.indigo[11],
      dark: '#4d61ab',
    },
    secondary: interactiveSecondary,
    'secondary-hover': {
      light: '#e5e9f5',
      dark: '#14161c',
    },
    'secondary-press': {
      light: '#dce2f4',
      dark: '#1b223b',
    },
    danger: {
      light: colorScales.red[9],
      dark: colorScales.red[11],
    },
    'danger-hover': {
      light: colorScales.red[10],
      dark: colorScales.red[10],
    },
    'danger-press': {
      light: colorScales.red[11],
      dark: colorScales.red[9],
    },
  },
  actions: {
    'hover-overlay': {
      light: colorAlphaScales.neutral[10],
      dark: `color-mix(in srgb, ${colorScales.neutral[4]} 15%, transparent)`,
    },
    'press-overlay': {
      light: colorAlphaScales.neutral[15],
      dark: `color-mix(in srgb, ${colorScales.neutral[4]} 20%, transparent)`,
    },
    'brand-hover': {
      light: colorAlphaScales.indigo[10],
      dark: colorAlphaScales.indigo[5],
    },
  },
  overlay: {
    backdrop: {
      light: colorAlphaScales.slate[20],
      dark: colorAlphaScales.slate[20],
    },
  },
};
