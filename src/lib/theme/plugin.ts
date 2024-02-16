import plugin from 'tailwindcss/plugin';

import colors, { getColor } from './colors';
import { css, rgb } from './utilities';

const variables = {
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
  '--color-text-error': rgb(getColor('red', 950)),
  '--color-text-information': rgb(getColor('blue', 950)),
  '--color-text-success': rgb(getColor('green', 950)),
  '--color-text-warning': rgb(getColor('yellow', 950)),

  '--color-surface-primary': rgb(colors.white),
  '--color-surface-secondary': rgb(colors.offWhite),
  '--color-surface-inverse': rgb(colors.primary),
  '--color-surface-subtle': rgb(getColor('slate', 100)),
  '--color-surface-badge': rgb(getColor('slate', 100)),
  '--color-surface-error': rgb(getColor('red', 50)),
  '--color-surface-information': rgb(getColor('blue', 50)),
  '--color-surface-success': rgb(getColor('green', 50)),
  '--color-surface-warning': rgb(getColor('red', 300)),

  '--color-border-primary': rgb(colors.black),
  '--color-border-subtle': rgb(getColor('slate', 300)),
  '--color-border-error': rgb(getColor('red', 800)),
  '--color-border-information': rgb(getColor('blue', 800)),
  '--color-border-success': rgb(getColor('green', 800)),
  '--color-border-warning': rgb(getColor('red', 300)),
  '--color-border-interactive': rgb(getColor('indigo', 600)),
} satisfies Variables;

const dark: Partial<Variables<keyof typeof variables>> = {
  '--color-primary': rgb(colors.offWhite),
  '--color-secondary': rgb(colors.offBlack),
  '--color-inverse': rgb(colors.primary),
  '--color-brand': rgb(getColor('indigo', 500)),

  '--color-text-primary': rgb(colors.offWhite),
  '--color-text-secondary': rgb(getColor('slate', 200)),
  '--color-text-subtle': rgb(getColor('slate', 700)),
  '--color-text-information': rgb(getColor('blue', 100)),
  '--color-text-warning': rgb(getColor('yellow', 100)),
  '--color-text-error': rgb(getColor('red', 100)),
  '--color-text-success': rgb(getColor('green', 100)),

  '--color-surface-primary': rgb(colors.black),
  '--color-surface-secondary': rgb(colors.offBlack),
  '--color-surface-subtle': rgb(getColor('slate', 900)),
  '--color-surface-badge': rgb(getColor('slate', 700)),
  '--color-surface-information': rgb(getColor('blue', 950)),
  '--color-surface-warning': rgb(getColor('red', 300)),
  '--color-surface-error': rgb(getColor('red', 950)),
  '--color-surface-success': rgb(getColor('green', 950)),

  '--color-border-primary': rgb(colors.offWhite),
  '--color-border-subtle': rgb(getColor('slate', 950)),
  '--color-border-information': rgb(getColor('blue', 700)),
  '--color-border-warning': rgb(getColor('red', 300)),
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
        interactiveHover: css('--color-interactive-hover'),

        error: css('--color-surface-error'),
        information: css('--color-surface-information'),
        success: css('--color-surface-success'),
        warning: css('--color-surface-warning'),

        DEFAULT: css('--color-surface-primary'),
      }),
      borderColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-border-primary'),
        subtle: css('--color-border-subtle'),
        interactive: css('--color-interactive'),
        interactiveHover: css('--color-interactive-hover'),

        error: css('--color-border-error'),
        information: css('--color-border-information'),
        success: css('--color-border-success'),
        warning: css('--color-border-warning'),

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

        DEFAULT: css('--color-text-primary'),
      }),
    },
  },
);

export default temporal;
export { colors };
