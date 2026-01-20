import plugin from 'tailwindcss/plugin';

import { colors } from './colors';
import { css } from './utilities';
import { dark, light } from './variables';

const textStyles = plugin(({ addBase, theme }) => {
  addBase({
    h1: {
      fontSize: theme('fontSize.3xl'),
      fontWeight: theme('fontWeight.medium'),
    },
    h2: {
      fontSize: theme('fontSize.2xl'),
      fontWeight: theme('fontWeight.medium'),
    },
    h3: {
      fontSize: theme('fontSize.xl'),
      fontWeight: theme('fontWeight.medium'),
    },
    h4: {
      fontSize: theme('fontSize.lg'),
      fontWeight: theme('fontWeight.medium'),
    },
    h5: {
      fontSize: theme('fontSize.base'),
      fontWeight: theme('fontWeight.medium'),
    },
    h6: {
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.medium'),
    },
    '.body-normal': {
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.normal'),
    },
    '.body-medium': {
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.medium'),
    },
    '.body-small': {
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.normal'),
    },
    '.body-small-medium': {
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.medium'),
    },
    '.body-small-mono': {
      fontFamily: theme('fontFamily.mono'),
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.normal'),
    },
  });
});

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
      '.surface-interactive': {
        backgroundColor: css('--color-interactive-surface'),
        color: css('--color-text-white'),
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
      '.surface-interactive-danger': {
        backgroundColor: css('--color-interactive-danger-surface'),
        color: css('--color-text-black'),
        '&:focus-visible': {
          backgroundColor: css('--color-interactive-danger-hover'),
        },
        '&:hover': {
          backgroundColor: css('--color-interactive-danger-hover'),
        },
        '&:active': {
          backgroundColor: css('--color-interactive-danger-active'),
        },
      },
      '.surface-interactive-ghost': {
        backgroundColor: css('--color-surface-primary'),
        color: css('--color-text-primary'),
        '&:focus-visible': {
          backgroundColor: css('--color-interactive-ghost-hover'),
        },
        '&:hover': {
          backgroundColor: css('--color-interactive-ghost-hover'),
        },
        '&:active': {
          backgroundColor: css('--color-interactive-ghost-active'),
        },
      },
      '.surface-information': {
        backgroundColor: css('--color-surface-information'),
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
      '.surface-table': {
        backgroundColor: css('--color-surface-table'),
        color: css('--color-text-inverse'),
      },
      '.surface-table-header': {
        backgroundColor: css('--color-surface-table-header'),
        color: css('--color-text-primary'),
      },
      '.surface-warning': {
        backgroundColor: css('--color-surface-subtle'),
        color: css('--color-text-black'),
      },
      '.surface-danger': {
        backgroundColor: css('--color-surface-danger'),
        color: css('--color-text-primary'),
      },
      '.surface-table-related-hover': {
        backgroundColor: css('--color-surface-table-related-hover'),
        color: css('--color-text-primary'),
      },
      '.surface-black': {
        backgroundColor: css('--color-surface-black'),
        color: css('--color-text-white'),
      },
      '.surface-development': {
        backgroundColor: css('--color-surface-development'),
        color: css('--color-text-white'),
      },
      '.surface-test': {
        backgroundColor: css('--color-surface-test'),
        color: css('--color-text-white'),
      },
      '.surface-staging': {
        backgroundColor: css('--color-surface-staging'),
        color: css('--color-text-white'),
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

        interactive: css('--color-interactive-surface'),
        'interactive-hover': css('--color-interactive-hover'),
        'interactive-active': css('--color-interactive-active'),
        'interactive-error': css('--color-interactive-danger-surface'),

        'interactive-secondary-hover': css(
          '--color-interactive-secondary-hover',
        ),
        'interactive-secondary-active': css(
          '--color-interactive-secondary-active',
        ),
        'interactive-table-hover': css('--color-interactive-table-hover'),

        information: css('--color-surface-information'),
        success: css('--color-surface-success'),
        warning: css('--color-surface-warning'),
        danger: css('--color-surface-danger'),
        'code-block': css('--color-surface-code-block'),

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
        'table-related-hover': css('--color-surface-table-related-hover'),
        information: css('--color-border-information'),
        success: css('--color-border-success'),
        warning: css('--color-border-warning'),
        danger: css('--color-border-danger'),

        DEFAULT: css('--color-border-primary'),
      }),
      ringColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-border-focus-info'),
        danger: css('--color-border-focus-danger'),
        success: css('--color-surface-success-loud'),
        brand: css('--color-surface-brand'),
      }),
      textColor: ({ theme }) => ({
        ...theme('colors'),
        primary: css('--color-text-primary'),
        secondary: css('--color-text-secondary'),
        subtle: css('--color-text-subtle'),
        inverse: css('--color-text-inverse'),
        brand: css('--color-text-brand'),

        danger: css('--color-text-danger'),
        information: css('--color-text-information'),
        success: css('--color-text-success'),
        warning: css('--color-text-warning'),

        DEFAULT: css('--color-text-primary'),
      }),
      caretColor: ({ theme }) => ({
        ...theme('colors'),

        danger: css('--color-text-danger'),
      }),
      extend: {
        transitionProperty: {
          width: 'width',
          height: 'height',
          left: 'left',
          right: 'right',
        },
      },
    },
  },
);

export default temporal;
export { colors, textStyles };
