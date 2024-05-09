import { colors } from './colors';
import { getRGB } from './utilities';

export type Variable = keyof typeof variables;

const light: Record<CSSVariable, RGB> = {};
const dark: Record<CSSVariable, RGB> = {};

export const variables = {
  '--color-primary': {
    light: colors.primary,
    dark: colors.offWhite,
  },
  '--color-secondary': {
    light: colors.secondary,
    dark: colors.offBlack,
  },
  '--color-inverse': {
    light: colors.black,
    dark: colors.primary,
  },
  '--color-subtle': {
    light: ['slate', 950],
    dark: ['slate', 200],
  },
  '--color-brand': {
    light: ['indigo', 800],
    dark: ['indigo', 500],
  },
  '--color-interactive': {
    light: ['indigo', 600],
    dark: ['indigo', 500],
  },
  '--color-interactive-hover': {
    light: ['indigo', 700],
    dark: ['indigo', 600],
  },
  '--color-interactive-error': {
    light: ['red', 600],
    dark: ['red', 400],
  },
  '--color-interactive-active': {
    light: ['indigo', 600],
    dark: ['indigo', 500],
  },
  '--color-warning': {
    light: ['yellow', 100],
    dark: ['yellow', 950],
  },
  '--color-text-black': {
    light: colors.black,
    dark: colors.black,
  },
  '--color-text-primary': {
    light: colors.primary,
    dark: colors.offWhite,
  },
  '--color-text-secondary': {
    light: colors.secondary,
    dark: ['slate', 200],
  },
  '--color-text-inverse': {
    light: colors.offWhite,
    dark: colors.primary,
  },
  '--color-text-subtle': {
    light: ['slate', 300],
    dark: ['slate', 200],
  },
  '--color-text-disabled': {
    light: ['slate', 500],
    dark: ['slate', 100],
  },
  '--color-text-error': {
    light: ['red', 700],
    dark: ['red', 100],
  },
  '--color-text-information': {
    light: ['blue', 700],
    dark: ['blue', 300],
  },
  '--color-text-success': {
    light: ['green', 700],
    dark: ['green', 100],
  },
  '--color-text-warning': {
    light: ['yellow', 500],
    dark: ['yellow', 300],
  },
  '--color-text-active': {
    light: ['indigo', 600],
    dark: ['indigo', 500],
  },

  '--color-surface-background': {
    light: colors.offWhite,
    dark: colors.offBlack,
  },
  '--color-surface-primary': {
    light: colors.white,
    dark: colors.black,
  },
  '--color-surface-secondary': {
    light: colors.offWhite,
    dark: colors.offBlack,
  },
  '--color-surface-interactive': {
    light: ['indigo', 600],
    dark: ['indigo', 600],
  },
  '--color-surface-interactive-secondary': {
    light: ['slate', 100],
    dark: ['slate', 800],
  },
  '--color-surface-secondary-active': {
    light: ['slate', 200],
    dark: ['slate', 900],
  },
  '--color-surface-disabled': {
    light: ['slate', 50],
    dark: ['slate', 100],
  },
  '--color-surface-inverse': {
    light: colors.primary,
    dark: colors.black,
  },
  '--color-surface-subtle': {
    light: ['slate', 100],
    dark: ['slate', 900],
  },
  '--color-surface-table': {
    light: colors.black,
    dark: ['slate', 900],
  },
  '--color-surface-badge': {
    light: ['slate', 100],
    dark: ['slate', 700],
  },
  '--color-surface-error': {
    light: ['red', 50],
    dark: ['red', 950],
  },
  '--color-surface-information': {
    light: ['blue', 50],
    dark: ['indigo', 950],
  },
  '--color-surface-success': {
    light: ['green', 50],
    dark: ['green', 950],
  },
  '--color-surface-warning': {
    light: ['yellow', 100],
    dark: ['yellow', 950],
  },
  '--color-surface-danger': {
    light: ['red', 300],
    dark: ['red', 300],
  },

  '--color-border-primary': {
    light: colors.black,
    dark: ['slate', 600],
  },
  '--color-border-secondary': {
    light: ['slate', 200],
    dark: ['slate', 700],
  },
  '--color-border-subtle': {
    light: ['slate', 300],
    dark: ['slate', 800],
  },
  '--color-border-table': {
    light: colors.black,
    dark: ['slate', 900],
  },
  '--color-border-inverse': {
    light: colors.offWhite,
    dark: colors.black,
  },
  '--color-border-disabled': {
    light: ['slate', 300],
    dark: ['slate', 100],
  },
  '--color-border-error': {
    light: ['red', 500],
    dark: ['red', 700],
  },
  '--color-border-information': {
    light: ['blue', 800],
    dark: ['blue', 700],
  },
  '--color-border-success': {
    light: ['green', 800],
    dark: ['green', 700],
  },
  '--color-border-warning': {
    light: ['yellow', 400],
    dark: ['yellow', 700],
  },
  '--color-border-danger': {
    light: ['red', 300],
    dark: ['red', 300],
  },
  '--color-border-interactive': {
    light: ['indigo', 600],
    dark: ['indigo', 600],
  },
  '--color-border-interactive-secondary': {
    light: ['slate', 100],
    dark: ['slate', 800],
  },
  '--color-shadow-primary': {
    light: ['indigo', 600],
    dark: ['indigo', 600],
  },
  '--color-shadow-secondary': {
    light: ['indigo', 500],
    dark: ['indigo', 500],
  },
  '--color-shadow-danger': {
    light: ['red', 200],
    dark: ['red', 600],
  },
} as const satisfies ColorVariables;

for (const key in variables) {
  const value = variables[key];
  light[key] = getRGB(value.light);
  dark[key] = getRGB(value.dark);
}

export { light, dark };
