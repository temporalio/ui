import plugin from 'tailwindcss/plugin';

import { colors } from './colors';
import { defaultPalette, paletteNames } from './palettes';
import { css } from './utilities';
import { paletteCSSVariables } from './variables';

const defaultPaletteVariables = paletteCSSVariables[defaultPalette];
const alternatePaletteVariables = Object.fromEntries(
  paletteNames
    .filter((palette) => palette !== defaultPalette)
    .flatMap((palette) => [
      [
        `:root[data-palette="${palette}"], [data-palette="${palette}"][data-theme="light"]`,
        paletteCSSVariables[palette].light,
      ],
      [
        `[data-palette="${palette}"][data-theme="dark"]`,
        paletteCSSVariables[palette].dark,
      ],
    ]),
);

const textStyles = plugin(({ addBase, theme }) => {
  addBase({
    h1: {
      fontSize: '1.5rem',
      fontWeight: theme('fontWeight.semibold'),
      letterSpacing: '-0.02em',
      lineHeight: '1.875rem',
      textWrap: 'balance',
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: theme('fontWeight.semibold'),
      letterSpacing: '-0.015em',
      lineHeight: '1.625rem',
      textWrap: 'balance',
    },
    h3: {
      fontSize: theme('fontSize.base'),
      fontWeight: theme('fontWeight.semibold'),
      letterSpacing: '-0.01em',
      lineHeight: '1.375rem',
    },
    h4: {
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.semibold'),
      lineHeight: '1.25rem',
    },
    h5: {
      fontSize: '0.8125rem',
      fontWeight: theme('fontWeight.semibold'),
      lineHeight: '1.125rem',
    },
    h6: {
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.semibold'),
      letterSpacing: '0.04em',
      lineHeight: '1rem',
      textTransform: 'uppercase',
    },
    '.body-normal': {
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.normal'),
      lineHeight: '1.25rem',
    },
    '.body-medium': {
      fontSize: theme('fontSize.sm'),
      fontWeight: theme('fontWeight.medium'),
      lineHeight: '1.25rem',
    },
    '.body-small': {
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.normal'),
      lineHeight: '1rem',
    },
    '.body-small-medium': {
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.medium'),
      lineHeight: '1rem',
    },
    '.body-small-mono': {
      fontFamily: theme('fontFamily.mono'),
      fontSize: theme('fontSize.xs'),
      fontWeight: theme('fontWeight.normal'),
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '1rem',
    },
  });
});

const temporal = plugin(
  ({ addComponents, addBase }) => {
    addBase({
      ':root': defaultPaletteVariables.light,
      '[data-theme="dark"]': defaultPaletteVariables.dark,
      ...alternatePaletteVariables,
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
        color: css('--color-text-white'),
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
        backgroundColor: css('--color-surface-warning'),
        color: css('--color-text-primary'),
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
    });
  },
  {
    theme: {
      colors: {
        ...colors,
        brand: css('--color-surface-brand'),
        'status-information': css('--color-border-information'),
        'status-success': css('--color-border-success'),
        'status-warning': css('--color-border-warning'),
        'status-danger': css('--color-border-danger'),
        'status-muted': css('--color-workflow-relationship-connector'),
        'workflow-relationship-connector': css(
          '--color-workflow-relationship-connector',
        ),
        'workflow-relationship-current': css(
          '--color-workflow-relationship-current',
        ),
        'workflow-relationship-placeholder': css(
          '--color-workflow-relationship-placeholder',
        ),
      },
      backgroundColor: ({ theme }) => ({
        ...theme('colors'),

        canvas: css('--color-surface-background'),
        'surface-1': css('--color-surface-primary'),
        'surface-2': css('--color-surface-secondary'),
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
        hairline: css('--color-border-subtle'),
        strong: css('--color-border-primary'),
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
        fg: css('--color-text-primary'),
        'fg-muted': css('--color-text-secondary'),
        'fg-subtle': css('--color-text-subtle'),
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
        borderRadius: {
          control: 'var(--radius-control)',
          panel: 'var(--radius-panel)',
          overlay: 'var(--radius-overlay)',
        },
        boxShadow: {
          raised: 'var(--shadow-raised)',
          floating: 'var(--shadow-floating)',
          modal: 'var(--shadow-modal)',
        },
        height: {
          'control-xs': 'var(--control-height-xs)',
          'control-sm': 'var(--control-height-sm)',
          control: 'var(--control-height)',
          row: 'var(--row-height)',
          target: 'var(--target-size)',
        },
        minHeight: {
          'control-xs': 'var(--control-height-xs)',
          'control-sm': 'var(--control-height-sm)',
          control: 'var(--control-height)',
          target: 'var(--target-size)',
        },
        transitionProperty: {
          width: 'width',
          height: 'height',
          left: 'left',
          right: 'right',
        },
        transitionDuration: {
          instant: 'var(--duration-instant)',
          fast: 'var(--duration-fast)',
          normal: 'var(--duration-normal)',
        },
        transitionTimingFunction: {
          standard: 'var(--ease-standard)',
          enter: 'var(--ease-enter)',
          exit: 'var(--ease-exit)',
        },
        zIndex: {
          dropdown: 'var(--z-dropdown)',
          sticky: 'var(--z-sticky)',
          navigation: 'var(--z-navigation)',
          backdrop: 'var(--z-backdrop)',
          modal: 'var(--z-modal)',
          toast: 'var(--z-toast)',
          tooltip: 'var(--z-tooltip)',
        },
      },
    },
  },
);

export default temporal;
export { colors, textStyles };
