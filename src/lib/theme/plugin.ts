import plugin from 'tailwindcss/plugin';

import colors, { getColor } from './colors';
import { css, rgb } from './utilities';

export const variables = {
  '--color-primary': rgb(colors.primary),
  '--color-secondary': rgb(colors.secondary),
  '--color-inverse': rgb(colors.black),
  '--color-subtle': rgb(getColor('slate', 950)),
  '--color-brand': rgb(getColor('indigo', 800)),
  '--color-interactive': rgb(getColor('indigo', 600)),
  '--color-interactive-hover': rgb(getColor('indigo', 700)),

  '--color-text-black': rgb(colors.black),
  '--color-text-primary': rgb(colors.primary),
  '--color-text-secondary': rgb(colors.secondary),
  '--color-text-inverse': rgb(colors.offWhite),
  '--color-text-subtle': rgb(getColor('slate', 900)),
  '--color-text-disabled': rgb(getColor('slate', 500)),
  '--color-text-error': rgb(getColor('red', 700)),
  '--color-text-information': rgb(getColor('blue', 700)),
  '--color-text-success': rgb(getColor('green', 700)),
  '--color-text-warning': rgb(getColor('yellow', 500)),
  '--color-text-active': rgb(getColor('indigo', 600)),

  '--color-surface-primary': rgb(colors.white),
  '--color-surface-secondary': rgb(colors.offWhite),
  '--color-surface-interactive': rgb(getColor('indigo', 600)),
  '--color-surface-interactive-secondary': rgb(getColor('slate', 100)),
  '--color-surface-disabled': rgb(getColor('slate', 50)),
  '--color-surface-inverse': rgb(colors.primary),
  '--color-surface-subtle': rgb(getColor('slate', 100)),
  '--color-surface-badge': rgb(getColor('slate', 100)),
  '--color-surface-error': rgb(getColor('red', 50)),
  '--color-surface-information': rgb(getColor('blue', 50)),
  '--color-surface-success': rgb(getColor('green', 50)),
  '--color-surface-warning': rgb(getColor('yellow', 950)),
  '--color-surface-danger': rgb(getColor('red', 300)),

  '--color-border-primary': rgb(colors.black),
  '--color-border-secondary': rgb(getColor('slate', 300)),
  '--color-border-subtle': rgb(getColor('slate', 300)),
  '--color-border-inverse': rgb(colors.offWhite),
  '--color-border-disabled': rgb(getColor('slate', 300)),
  '--color-border-error': rgb(getColor('red', 800)),
  '--color-border-information': rgb(getColor('blue', 800)),
  '--color-border-success': rgb(getColor('green', 800)),
  '--color-border-warning': rgb(getColor('yellow', 950)),
  '--color-border-danger': rgb(getColor('red', 300)),
  '--color-border-interactive': rgb(getColor('indigo', 600)),
  '--color-border-interactive-secondary': rgb(getColor('slate', 600)),

  '--color-shadow-primary': rgb(getColor('indigo', 600)),
  '--color-shadow-secondary': rgb(getColor('indigo', 500)),
} as const satisfies Variables;

const dark: Partial<Variables<keyof typeof variables>> = {
  '--color-primary': rgb(colors.offWhite),
  '--color-secondary': rgb(colors.offBlack),
  '--color-inverse': rgb(colors.primary),
  '--color-brand': rgb(getColor('indigo', 500)),

  '--color-text-primary': rgb(colors.offWhite),
  '--color-text-secondary': rgb(getColor('slate', 200)),
  '--color-text-subtle': rgb(getColor('slate', 200)),
  '--color-text-disabled': rgb(getColor('slate', 100)),
  '--color-text-information': rgb(getColor('blue', 300)),
  '--color-text-warning': rgb(getColor('yellow', 300)),
  '--color-text-error': rgb(getColor('red', 100)),
  '--color-text-success': rgb(getColor('green', 100)),
  '--color-text-active': rgb(getColor('indigo', 500)),

  '--color-surface-primary': rgb(colors.black),
  '--color-surface-secondary': rgb(colors.offBlack),
  '--color-surface-interactive-secondary': rgb(getColor('slate', 800)),
  '--color-surface-subtle': rgb(getColor('slate', 900)),
  '--color-surface-badge': rgb(getColor('slate', 700)),
  '--color-surface-information': rgb(getColor('blue', 950)),
  '--color-surface-warning': rgb(getColor('yellow', 950)),
  '--color-surface-danger': rgb(getColor('red', 300)),
  '--color-surface-error': rgb(getColor('red', 950)),
  '--color-surface-success': rgb(getColor('green', 950)),

  '--color-border-primary': rgb(colors.offWhite),
  '--color-border-secondary': rgb(getColor('slate', 600)),
  '--color-border-subtle': rgb(getColor('slate', 800)),
  '--color-border-inverse': rgb(colors.black),
  '--color-border-disabled': rgb(getColor('slate', 100)),
  '--color-border-information': rgb(getColor('blue', 700)),
  '--color-border-interactive': rgb(getColor('indigo', 600)),
  '--color-border-warning': rgb(getColor('yellow', 950)),
  '--color-border-danger': rgb(getColor('red', 300)),
  '--color-border-error': rgb(getColor('red', 700)),
  '--color-border-success': rgb(getColor('green', 700)),
} as const;

const temporal = plugin(
  ({ addComponents, addBase }) => {
    addBase({
      ':root': variables,
      ':is(body.dark *)': dark,
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
      '.surface-interactive': {
        backgroundColor: css('--color-surface-interactive'),
        color: css('--color-text-primary'),
      },
      '.surface-interactive-secondary': {
        backgroundColor: css('--color-surface-interactive-secondary'),
        color: css('--color-text-primary'),
      },
      '.surface-inverse': {
        backgroundColor: css('--color-surface-inverse'),
        color: css('--color-text-inverse'),
      },
      '.surface-subtle': {
        backgroundColor: css('--color-surface-subtle'),
        color: css('--color-text-primary'),
      },
      '.surface-warning': {
        backgroundColor: css('--color-surface-subtle'),
        color: css('--color-text-black'),
      },
      '.surface-disabled': {
        backgroundColor: css('--color-surface-secondary'),
        color: css('--color-text-disabled'),
      },
      '.shadow-primary': {
        boxShadow: `0 0 0 4px ${css('--color-shadow-primary', 50)}`,
      },
      '.shadow-secondary': {
        boxShadow: `0 0 0 4px ${css('--color-shadow-secondary')}`,
      },
    });
  },
  {
    theme: {
      colors: {
        ...colors,
        brand: css('--color-brand'),
      },
      backgroundColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-primary'),
        secondary: css('--color-secondary'),
        inverse: css('--color-inverse'),
        subtle: css('--color-subtle'),
        badge: css('--color-surface-badge'),
        interactive: css('--color-interactive'),
        'interactive-hover': css('--color-interactive-hover'),

        error: css('--color-surface-error'),
        information: css('--color-surface-information'),
        success: css('--color-surface-success'),
        warning: css('--color-surface-warning'),
        danger: css('--color-surface-danger'),

        DEFAULT: css('--color-surface-primary'),
      }),
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-border-primary'),
        secondary: css('--color-border-secondary'),
        subtle: css('--color-border-subtle'),
        interactive: css('--color-interactive'),
        'interactive-hover': css('--color-interactive-hover'),
        inverse: css('--color-border-inverse'),
        disabled: css('--color-border-disabled'),

        error: css('--color-border-error'),
        information: css('--color-border-information'),
        success: css('--color-border-success'),
        warning: css('--color-border-warning'),
        danger: css('--color-border-danger'),

        DEFAULT: css('--color-border-primary'),
      }),
      textColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-text-primary'),
        secondary: css('--color-text-secondary'),
        disabled: css('--color-text-disabled'),
        subtle: css('--color-text-subtle'),
        inverse: css('--color-text-inverse'),

        error: css('--color-text-error'),
        information: css('--color-text-information'),
        success: css('--color-text-success'),
        warning: css('--color-text-warning'),
        active: css('--color-text-active'),

        DEFAULT: css('--color-text-primary'),
      }),
      outlineColor: ({ theme }) => ({
        ...theme('colors'),

        interactive: css('--color-interactive'),
      }),
    },
  },
);

export default temporal;
export { colors };
