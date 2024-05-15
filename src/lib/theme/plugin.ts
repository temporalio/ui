import plugin from 'tailwindcss/plugin';

import { colors } from './colors';
import { css } from './utilities';
import { dark, light } from './variables';

const temporal = plugin(
  ({ addComponents, addBase }) => {
    addBase({
      ':root': light,
      '[data-theme="dark"]': dark,
    });

    addComponents({
      '.surface-background': {
        backgroundColor: css('--color-surface-background'),
        color: css('--color-text-primary'),
      },
      '.surface-primary': {
        backgroundColor: css('--color-surface-primary'),
        color: css('--color-text-primary'),
      },
      '.surface-secondary': {
        backgroundColor: css('--color-surface-secondary'),
        color: css('--color-text-primary'),
      },
      '.surface-input': {
        backgroundColor: css('--color-surface-primary'),
        color: css('--color-text-primary'),
      },
      '.surface-interactive': {
        backgroundColor: css('--color-interactive-surface'),
        color: css('--color-text-primary'),
        '&:focus-visible': {
          backgroundColor: css('--color-interactive-hover'),
        },
        '&:hover': {
          backgroundColor: css('--color-interactive-hover'),
        },
        '&:active': {
          backgroundColor: css('--color-interactive-active'),
        },
      },
      '.surface-interactive-secondary': {
        backgroundColor: css('--color-interactive-secondary-surface'),
        color: css('--color-text-primary'),
        '&:focus-visible': {
          backgroundColor: css('--color-interactive-secondary-hover'),
        },
        '&:hover': {
          backgroundColor: css('--color-interactive-secondary-hover'),
        },
        '&:active': {
          backgroundColor: css('--color-interactive-secondary-active'),
        },
      },
      '.surface-inverse': {
        backgroundColor: css('--color-surface-inverse'),
        color: css('--color-text-inverse'),
      },
      '.surface-subtle': {
        backgroundColor: css('--color-surface-subtle'),
        color: css('--color-text-primary'),
      },
      '.surface-table': {
        backgroundColor: css('--color-surface-table'),
        color: css('--color-text-inverse'),
      },
      '.surface-warning': {
        backgroundColor: css('--color-surface-subtle'),
        color: css('--color-text-black'),
      },
      '.surface-disabled': {
        backgroundColor: css('--color-surface-secondary'),
        color: css('--color-text-disabled'),
      },
    });
  },
  {
    theme: {
      colors: {
        ...colors,
        brand: css('--color-surface-brand'),
      },
      backgroundColor: ({ theme }) => ({
        ...theme('colors'),

        primary: css('--color-surface-primary'),
        secondary: css('--color-surface-secondary'),
        inverse: css('--color-surface-inverse'),
        subtle: css('--color-surface-subtle'),

        badge: css('--color-surface-badge'),

        interactive: css('--color-interactive-surface'),
        'interactive-hover': css('--color-interactive-hover'),
        'interactive-active': css('--color-interactive-active'),
        'interactive-error': css('--color-interactive-danger-surface'),

        'interactive-secondary-active': css(
          '--color-interactive-secondary-active',
        ),

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
        interactive: css('--color-interactive-surface'),
        'interactive-hover': css('--color-interactive-hover'),
        inverse: css('--color-border-inverse'),
        table: css('--color-border-table'),
        information: css('--color-border-information'),
        success: css('--color-border-success'),
        warning: css('--color-border-warning'),
        danger: css('--color-border-danger'),

        DEFAULT: css('--color-border-primary'),
      }),
      ringColor: {
        primary: css('--color-border-focus-info'),
        danger: css('--color-border-focus-danger'),
      },
      textColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-text-primary'),
        secondary: css('--color-text-secondary'),
        disabled: css('--color-text-disabled'),
        subtle: css('--color-text-subtle'),
        inverse: css('--color-text-inverse'),
        brand: css('--color-text-brand'),

        danger: css('--color-text-danger'),
        information: css('--color-text-information'),
        success: css('--color-text-success'),
        warning: css('--color-text-warning'),

        DEFAULT: css('--color-text-primary'),
      }),
      extend: {
        transitionProperty: {
          width: 'width',
          height: 'height',
          left: 'left',
          right: 'right',
        },
      },
      outlineColor: ({ theme }) => ({
        ...theme('colors'),

        interactive: css('--color-interactive-surface'),
      }),
    },
  },
);

export default temporal;
export { colors };
