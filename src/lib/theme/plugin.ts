import plugin from 'tailwindcss/plugin';

import { themesBaseStyles } from './io/themes';
import { colorTheme, opacityTheme } from './tailwind-colors';

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
  ({ addBase }) => {
    addBase(themesBaseStyles);
  },
  {
    future: {
      respectDefaultRingColorOpacity: true,
    },
    theme: {
      ...colorTheme,
      extend: {
        opacity: opacityTheme,
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
export { textStyles };
