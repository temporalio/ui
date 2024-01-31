import plugin from 'tailwindcss/plugin';

import colors, { getColor } from './colors';
import { rgb } from './utilities';

const variables = {
  '--color-primary': rgb(colors.primary),
  '--color-secondary': rgb(colors.secondary),
  '--color-text-primary': rgb(colors.primary),
  '--color-text-secondary': rgb(colors.secondary),
  '--color-surface-primary': rgb(colors.white),
  '--color-surface-secondary': rgb(getColor('slate', 100)),
  '--color-border-primary': rgb(getColor('slate', 900)),
} as const;

const css = (variable: keyof typeof variables) => `rgb(var(${variable}))`;

const temporal = plugin(
  ({ addUtilities, addComponents, addBase }) => {
    addBase({
      ':root': variables,
    });

    addUtilities({
      '.text-primary': { color: css('--color-text-primary') },
      '.text-secondary': { color: css('--color-text-secondary') },
      '.bg-primary': { backgroundColor: css('--color-primary') },
      '.border-primary': { borderColor: css('--color-primary') },
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
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        DEFAULT: css('--color-border-primary'),
      }),
    },
  },
);

export default temporal;
export { colors };
