import { toColor } from './utilities';

export type Variable = keyof typeof variables;

const light: Record<CSSVariable, RGB> = {};
const dark: Record<CSSVariable, RGB> = {};

export const variables = {
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
    light: 'slate.800',
    dark: 'slate.300',
  },
  '--color-text-inverse': {
    light: 'off-white',
    dark: 'space-black',
  },
  '--color-text-subtle': {
    light: 'slate.700',
    dark: 'slate.700',
  },
  '--color-text-danger': {
    light: 'red.700',
    dark: 'red.400',
  },
  '--color-text-information': {
    light: 'indigo.600',
    dark: 'indigo.500',
  },
  '--color-text-success': {
    light: 'green.700',
    dark: 'green.600',
  },
  '--color-text-warning': {
    light: 'yellow.600',
    dark: 'yellow.500',
  },
  '--color-text-pink': {
    light: 'pink.800',
    dark: 'pink.400',
  },
  '--color-text-brand': {
    light: 'indigo.600',
    dark: 'indigo.400',
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
    light: 'off-white',
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
    light: 'green.100',
    dark: 'green.950',
  },
  '--color-surface-success-loud': {
    light: 'green.600',
    dark: 'green.600',
  },
  '--color-surface-information': {
    light: 'indigo.100',
    dark: 'indigo.950',
  },
  '--color-surface-information-loud': {
    light: 'indigo.600',
    dark: 'indigo.600',
  },
  '--color-surface-danger': {
    light: 'red.100',
    dark: 'red.950',
  },
  '--color-surface-warning': {
    light: 'yellow.100',
    dark: 'yellow.950',
  },
  '--color-surface-brand': {
    light: 'indigo.600',
    dark: 'indigo.500',
  },
  '--color-surface-inverse': {
    light: 'space-black',
    dark: 'off-white',
  },
  '--color-surface-black': {
    light: 'black',
    dark: 'black',
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
    dark: 'slate.500',
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
    light: 'red.300',
    dark: 'red.300',
  },
  '--color-interactive-danger-hover': {
    light: 'red.400',
    dark: 'red.400',
  },
  '--color-interactive-danger-active': {
    light: 'red.500',
    dark: 'red.500',
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
    light: 'indigo.200',
    dark: 'slate.700',
  },
  '--color-surface-table-related-hover': {
    light: 'indigo.100',
    dark: 'slate.900',
  },
  // Border
  '--color-border-primary': {
    light: 'space-black',
    dark: 'slate.400',
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
    light: 'space-black',
    dark: 'slate.900',
  },
  '--color-border-inverse': {
    light: 'off-white',
    dark: 'space-black',
  },
  '--color-border-information': {
    light: 'indigo.600',
    dark: 'indigo.500',
  },
  '--color-border-success': {
    light: 'green.600',
    dark: 'green.700',
  },
  '--color-border-warning': {
    light: 'yellow.400',
    dark: 'yellow.700',
  },
  '--color-border-danger': {
    light: 'red.500',
    dark: 'red.400',
  },
  '--color-border-focus-info': {
    light: 'indigo.600',
    dark: 'indigo.600',
  },
  '--color-border-focus-danger': {
    light: 'red.600',
    dark: 'red.600',
  },
} as const satisfies ColorVariables;

for (const key in variables) {
  const value = variables[key];
  light[key] = toColor(value.light);
  dark[key] = toColor(value.dark);
}

export { light, dark };
