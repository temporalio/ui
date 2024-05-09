import { colors } from './colors';
import { toColor as c } from './utilities';

export type Variable = keyof typeof variables;

const light: Record<CSSVariable, RGB> = {};
const dark: Record<CSSVariable, RGB> = {};

export const variables = {
  '--color-primary': c({
    light: colors.primary,
    dark: colors.offWhite,
  }),
  '--color-secondary': c({
    light: colors.secondary,
    dark: colors.offBlack,
  }),
  '--color-inverse': c({
    light: colors.black,
    dark: colors.primary,
  }),
  '--color-subtle': c({
    light: ['slate', 950],
    dark: ['slate', 200],
  }),
  '--color-brand': c({
    light: ['indigo', 800],
    dark: ['indigo', 500],
  }),
  '--color-interactive': c({
    light: ['indigo', 600],
    dark: ['indigo', 500],
  }),
  '--color-interactive-hover': c({
    light: ['indigo', 700],
    dark: ['indigo', 600],
  }),
  '--color-interactive-error': c({
    light: ['red', 600],
    dark: ['red', 400],
  }),
  '--color-interactive-active': c({
    light: ['indigo', 600],
    dark: ['indigo', 500],
  }),
  '--color-warning': c({
    light: ['yellow', 100],
    dark: ['yellow', 950],
  }),
  '--color-text-black': c({
    light: colors.black,
    dark: colors.black,
  }),
  '--color-text-primary': c({
    light: colors.primary,
    dark: colors.offWhite,
  }),
  '--color-text-secondary': c({
    light: colors.secondary,
    dark: ['slate', 200],
  }),
  '--color-text-inverse': c({
    light: colors.offWhite,
    dark: colors.primary,
  }),
  '--color-text-subtle': c({
    light: ['slate', 300],
    dark: ['slate', 200],
  }),
  '--color-text-disabled': c({
    light: ['slate', 500],
    dark: ['slate', 100],
  }),
  '--color-text-error': c({
    light: ['red', 700],
    dark: ['red', 100],
  }),
  '--color-text-information': c({
    light: ['blue', 700],
    dark: ['blue', 300],
  }),
  '--color-text-success': c({
    light: ['green', 700],
    dark: ['green', 100],
  }),
  '--color-text-warning': c({
    light: ['yellow', 500],
    dark: ['yellow', 300],
  }),
  '--color-text-active': c({
    light: ['indigo', 600],
    dark: ['indigo', 500],
  }),

  '--color-surface-background': c({
    light: colors.offWhite,
    dark: colors.offBlack,
  }),
  '--color-surface-primary': c({
    light: colors.white,
    dark: colors.black,
  }),
  '--color-surface-secondary': c({
    light: colors.offWhite,
    dark: colors.offBlack,
  }),
  '--color-surface-interactive': c({
    light: ['indigo', 600],
    dark: ['indigo', 600],
  }),
  '--color-surface-interactive-secondary': c({
    light: ['slate', 100],
    dark: ['slate', 800],
  }),
  '--color-surface-secondary-active': c({
    light: ['slate', 200],
    dark: ['slate', 900],
  }),
  '--color-surface-disabled': c({
    light: ['slate', 50],
    dark: ['slate', 100],
  }),
  '--color-surface-inverse': c({
    light: colors.primary,
    dark: colors.black,
  }),
  '--color-surface-subtle': c({
    light: ['slate', 100],
    dark: ['slate', 900],
  }),
  '--color-surface-table': c({
    light: colors.black,
    dark: ['slate', 900],
  }),
  '--color-surface-badge': c({
    light: ['slate', 100],
    dark: ['slate', 700],
  }),
  '--color-surface-error': c({
    light: ['red', 50],
    dark: ['red', 950],
  }),
  '--color-surface-information': c({
    light: ['blue', 50],
    dark: ['indigo', 950],
  }),
  '--color-surface-success': c({
    light: ['green', 50],
    dark: ['green', 950],
  }),
  '--color-surface-warning': c({
    light: ['yellow', 100],
    dark: ['yellow', 950],
  }),
  '--color-surface-danger': c({
    light: ['red', 300],
    dark: ['red', 300],
  }),

  '--color-border-primary': c({
    light: colors.black,
    dark: ['slate', 600],
  }),
  '--color-border-secondary': c({
    light: ['slate', 200],
    dark: ['slate', 700],
  }),
  '--color-border-subtle': c({
    light: ['slate', 300],
    dark: ['slate', 800],
  }),
  '--color-border-table': c({
    light: colors.black,
    dark: ['slate', 900],
  }),
  '--color-border-inverse': c({
    light: colors.offWhite,
    dark: colors.black,
  }),
  '--color-border-disabled': c({
    light: ['slate', 300],
    dark: ['slate', 100],
  }),
  '--color-border-error': c({
    light: ['red', 500],
    dark: ['red', 700],
  }),
  '--color-border-information': c({
    light: ['blue', 800],
    dark: ['blue', 700],
  }),
  '--color-border-success': c({
    light: ['green', 800],
    dark: ['green', 700],
  }),
  '--color-border-warning': c({
    light: ['yellow', 400],
    dark: ['yellow', 700],
  }),
  '--color-border-danger': c({
    light: ['red', 300],
    dark: ['red', 300],
  }),
  '--color-border-interactive': c({
    light: ['indigo', 600],
    dark: ['indigo', 600],
  }),
  '--color-border-interactive-secondary': c({
    light: ['slate', 100],
    dark: ['slate', 800],
  }),
  '--color-shadow-primary': c({
    light: ['indigo', 600],
    dark: ['indigo', 600],
  }),
  '--color-shadow-secondary': c({
    light: ['indigo', 500],
    dark: ['indigo', 500],
  }),
  '--color-shadow-danger': c({
    light: ['red', 200],
    dark: ['red', 600],
  }),
} as const satisfies ColorVariables;

for (const key in variables) {
  const value = variables[key];
  light[key] = value.light;
  dark[key] = value.dark;
}

export { light, dark };
