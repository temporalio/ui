import { colorAlphaScales } from './color-alpha-scales';
import { colorScales } from './color-scales';

export type SemanticColor = Readonly<{
  light: string;
  dark: string;
}>;

type BackgroundColors = Readonly<{
  primary: SemanticColor;
}>;

type ContentColors = Readonly<{
  primary: SemanticColor;
  secondary: SemanticColor;
  tertiary: SemanticColor;
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

type SemanticColors = Readonly<{
  background: BackgroundColors;
  content: ContentColors;
  surface: SurfaceColors;
  border: BorderColors;
  interactive: InteractiveColors;
  actions: ActionColors;
}>;

export const semanticColors: SemanticColors = {
  background: {
    primary: {
      light: colorScales.slate[1],
      dark: colorScales.slate[12],
    },
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
    primary: {
      light: colorAlphaScales.slate[5],
      dark: colorAlphaScales.slate[5],
    },
    secondary: {
      light: colorAlphaScales.slate[10],
      dark: colorAlphaScales.slate[10],
    },
    tertiary: {
      light: colorAlphaScales.slate[15],
      dark: colorAlphaScales.slate[15],
    },
    brand: {
      light: colorAlphaScales.indigo[20],
      dark: colorAlphaScales.indigo[20],
    },
    information: {
      light: colorAlphaScales.blue[20],
      dark: colorAlphaScales.blue[20],
    },
    success: {
      light: colorAlphaScales.green[20],
      dark: colorAlphaScales.green[20],
    },
    warning: {
      light: colorAlphaScales.amber[20],
      dark: colorAlphaScales.amber[20],
    },
    danger: {
      light: colorAlphaScales.red[20],
      dark: colorAlphaScales.red[20],
    },
    error: {
      light: colorAlphaScales.persimmon[20],
      dark: colorAlphaScales.persimmon[20],
    },
    status: {
      blue: {
        light: colorAlphaScales.blue[15],
        dark: colorAlphaScales.blue[15],
      },
      green: {
        light: colorAlphaScales.green[15],
        dark: colorAlphaScales.green[15],
      },
      red: {
        light: colorAlphaScales.red[15],
        dark: colorAlphaScales.red[15],
      },
      persimmon: {
        light: colorAlphaScales.persimmon[15],
        dark: colorAlphaScales.persimmon[15],
      },
      amber: {
        light: colorAlphaScales.amber[15],
        dark: colorAlphaScales.amber[15],
      },
      neutral: {
        light: colorAlphaScales.neutral[15],
        dark: `color-mix(in srgb, ${colorScales.neutral[4]} 15%, transparent)`,
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
    primary: {
      light: colorScales.indigo[9],
      dark: colorScales.indigo[10],
    },
    'primary-hover': {
      light: colorScales.indigo[10],
      dark: colorScales.indigo[9],
    },
    'primary-press': {
      light: colorScales.indigo[11],
      dark: colorAlphaScales.slate[40],
    },
    secondary: {
      light: colorScales.slate[1],
      dark: colorScales.slate[12],
    },
    'secondary-hover': {
      light: colorAlphaScales.indigo[10],
      dark: colorAlphaScales.indigo[5],
    },
    'secondary-press': {
      light: colorAlphaScales.indigo[15],
      dark: colorAlphaScales.indigo[20],
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
      light: colorAlphaScales.indigo[30],
      dark: colorAlphaScales.indigo[30],
    },
  },
};
