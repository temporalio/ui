import { colorAlphaScales } from './color-alpha-scales';
import { colorScales } from './color-scales';

export type SemanticColor = Readonly<{
  light: string;
  dark: string;
}>;

type SemanticColorMap = Readonly<
  Record<string, Readonly<Record<string, SemanticColor>>>
>;

const backgroundPrimary = {
  light: '#f8f8f8',
  dark: colorScales.neutral[12],
} satisfies SemanticColor;

const surfacePrimary = {
  light: colorScales.slate[1],
  dark: colorScales.neutral[11],
} satisfies SemanticColor;

const interactivePrimary = {
  light: colorScales.indigo[9],
  dark: colorScales.indigo[11],
} satisfies SemanticColor;

const interactiveSecondary = surfacePrimary;

const fixedBlack = {
  light: '#000000',
  dark: '#000000',
} satisfies SemanticColor;

const fixedWhite = {
  light: '#ffffff',
  dark: '#ffffff',
} satisfies SemanticColor;

export const semanticColors = {
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
    'static-text-info': {
      light: colorScales.blue[11],
      dark: colorScales.blue[9],
    },
    'static-text-success': {
      light: colorScales.green[11],
      dark: colorScales.green[9],
    },
    'static-text-warning': {
      light: colorScales.amber[11],
      dark: colorScales.amber[9],
    },
    'static-text-danger': {
      light: colorScales.red[11],
      dark: colorScales.red[9],
    },
    danger: {
      light: colorScales.red[12],
      dark: colorScales.red[7],
    },
    error: {
      light: colorScales.persimmon[12],
      dark: colorScales.persimmon[8],
    },
    accent: {
      light: colorScales.purple[12],
      dark: colorScales.purple[8],
    },
    'inverse-secondary': {
      light: colorScales.slate[6],
      dark: colorScales.slate[6],
    },
    'inverse-primary': {
      light: colorScales.slate[1],
      dark: colorScales.slate[12],
    },
    black: fixedBlack,
    white: fixedWhite,
  },
  surface: {
    primary: surfacePrimary,
    secondary: {
      light: colorScales.slate[2],
      dark: colorScales.neutral[10],
    },
    tertiary: {
      light: colorScales.slate[3],
      dark: colorScales.neutral[9],
    },
    'static-neutral': {
      light: colorScales.neutral[7],
      dark: colorScales.neutral[7],
    },
    brand: {
      light: colorScales.indigo[5],
      dark: colorScales.indigo[12],
    },
    information: {
      light: colorScales.blue[4],
      dark: colorScales.blue[12],
    },
    success: {
      light: colorScales.green[4],
      dark: colorScales.green[12],
    },
    warning: {
      light: colorScales.amber[2],
      dark: colorScales.amber[12],
    },
    danger: {
      light: colorScales.red[4],
      dark: colorScales.red[12],
    },
    error: {
      light: colorScales.persimmon[4],
      dark: colorScales.persimmon[12],
    },
    accent: {
      light: colorScales.purple[5],
      dark: colorScales.purple[12],
    },
  },
  border: {
    primary: {
      light: colorAlphaScales.slate[20],
      dark: colorAlphaScales.slate[30],
    },
    secondary: {
      light: colorAlphaScales.slate[40],
      dark: colorAlphaScales.slate[50],
    },
    tertiary: {
      light: colorAlphaScales.slate[60],
      dark: colorAlphaScales.slate[70],
    },
    brand: {
      light: colorScales.indigo[9],
      dark: colorAlphaScales.indigo[70],
    },
    information: {
      light: colorAlphaScales.blue[60],
      dark: colorAlphaScales.blue[70],
    },
    success: {
      light: colorAlphaScales.green[60],
      dark: colorAlphaScales.green[70],
    },
    warning: {
      light: colorAlphaScales.amber[60],
      dark: colorAlphaScales.amber[70],
    },
    danger: {
      light: colorAlphaScales.red[60],
      dark: colorAlphaScales.red[70],
    },
    error: {
      light: colorAlphaScales.persimmon[50],
      dark: colorAlphaScales.persimmon[70],
    },
    accent: {
      light: colorAlphaScales.purple[80],
      dark: colorAlphaScales.purple[80],
    },
  },
  interactive: {
    primary: interactivePrimary,
    'primary-hover': {
      light: colorScales.indigo[10],
      dark: colorScales.indigo[10],
    },
    'primary-press': {
      light: colorScales.indigo[11],
      dark: colorScales.indigo[9],
    },
    secondary: interactiveSecondary,
    'secondary-hover': {
      light: colorAlphaScales.indigo[10],
      dark: colorAlphaScales.indigo[10],
    },
    'secondary-press': {
      light: colorAlphaScales.indigo[15],
      dark: colorAlphaScales.indigo[20],
    },
    'tertiary-press': {
      light: colorAlphaScales.neutral[10],
      dark: colorAlphaScales.slate[20],
    },
    'tertiary-hover': {
      light: colorAlphaScales.neutral[5],
      dark: colorAlphaScales.slate[10],
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
      dark: colorAlphaScales.slate[15],
    },
    'press-overlay': {
      light: colorAlphaScales.neutral[15],
      dark: colorAlphaScales.slate[20],
    },
    'brand-hover': {
      light: colorAlphaScales.indigo[10],
      dark: colorAlphaScales.indigo[10],
    },
    'brand-press': {
      light: colorAlphaScales.indigo[15],
      dark: colorAlphaScales.indigo[20],
    },
  },
  overlay: {
    primary: {
      light: colorAlphaScales.neutral[5],
      dark: colorAlphaScales.slate[5],
    },
    secondary: {
      light: colorAlphaScales.neutral[10],
      dark: colorAlphaScales.slate[10],
    },
    tertiary: {
      light: colorAlphaScales.neutral[15],
      dark: colorAlphaScales.slate[15],
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
      dark: colorAlphaScales.amber[15],
    },
    danger: {
      light: colorAlphaScales.red[20],
      dark: colorAlphaScales.red[20],
    },
    error: {
      light: colorAlphaScales.persimmon[20],
      dark: colorAlphaScales.persimmon[20],
    },
    accent: {
      light: colorAlphaScales.purple[20],
      dark: colorAlphaScales.purple[20],
    },
    backdrop: {
      light: colorAlphaScales.slate[20],
      dark: colorAlphaScales.slate[20],
    },
  },
} satisfies SemanticColorMap;
