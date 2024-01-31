import plugin from 'tailwindcss/plugin';

import colors, { getColor } from './colors';
import { rgb } from './utilities';

const variables = {
  '--color-primary': rgb(colors.primary),
  '--color-secondary': rgb(colors.secondary),
  '--color-inverse': rgb(getColor('slate', 900)),
  '--color-text-primary': rgb(colors.primary),
  '--color-text-secondary': rgb(colors.secondary),
  '--color-surface-primary': rgb(colors.white),
  '--color-surface-secondary': rgb(getColor('slate', 100)),
  '--color-border-primary': 'var(--color-inverse)',
  '--color-border-subtle': rgb(getColor('slate', 300)),
} as const;

const css = (variable: keyof typeof variables) => `rgb(var(${variable}))`;

const temporal = plugin(
  ({ addComponents, addBase }) => {
    addBase({
      ':root': variables,
    });

    addComponents({
      '.surface-primary': {
        backgroundColor: css('--color-surface-primary'),
        color: css('--color-text-primary'),
      },
      '.surface-secondary': {
        backgroundColor: css('--color-surface-secondary'),
        color: css('--color-text-primary'),
      },
    });
  },
  {
    theme: {
      colors,
      backgroundColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-primary'),
        secondary: css('--color-secondary'),
        inverse: css('--color-inverse'),
        DEFAULT: css('--color-surface-primary'),
      }),
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-border-primary'),
        subtle: css('--color-border-subtle'),
        DEFAULT: css('--color-border-primary'),
      }),
      textColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-text-primary'),
        secondary: css('--color-text-secondary'),
        DEFAULT: css('--color-text-primary'),
      }),
    },
  },
);

export default temporal;
export { colors };
