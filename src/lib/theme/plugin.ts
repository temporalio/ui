import plugin from 'tailwindcss/plugin';

import {
  defaultThemeName,
  themes,
  themesBaseStyles,
  toCssVariableReferences,
} from './io/themes';
import { colorTheme, opacityTheme } from './tailwind-colors';

type FontSizeThemeValue =
  | string
  | [string, { lineHeight?: string }]
  | { fontSize: string };

const fontSizeValue = (value: FontSizeThemeValue) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0];
  return value.fontSize;
};

const textStyles = plugin(({ addBase, theme }) => {
  addBase({
    h1: {
      fontSize: fontSizeValue(theme('fontSize.3xl')),
      fontWeight: theme('fontWeight.medium'),
    },
    h2: {
      fontSize: fontSizeValue(theme('fontSize.2xl')),
      fontWeight: theme('fontWeight.medium'),
    },
    h3: {
      fontSize: fontSizeValue(theme('fontSize.xl')),
      fontWeight: theme('fontWeight.medium'),
    },
    h4: {
      fontSize: fontSizeValue(theme('fontSize.lg')),
      fontWeight: theme('fontWeight.medium'),
    },
    h5: {
      fontSize: fontSizeValue(theme('fontSize.base')),
      fontWeight: theme('fontWeight.medium'),
    },
    h6: {
      fontSize: fontSizeValue(theme('fontSize.sm')),
      fontWeight: theme('fontWeight.medium'),
    },
    '.body-normal': {
      fontSize: fontSizeValue(theme('fontSize.sm')),
      fontWeight: theme('fontWeight.normal'),
    },
    '.body-medium': {
      fontSize: fontSizeValue(theme('fontSize.sm')),
      fontWeight: theme('fontWeight.medium'),
    },
    '.body-small': {
      fontSize: fontSizeValue(theme('fontSize.xs')),
      fontWeight: theme('fontWeight.normal'),
    },
    '.body-small-medium': {
      fontSize: fontSizeValue(theme('fontSize.xs')),
      fontWeight: theme('fontWeight.medium'),
    },
    '.body-small-mono': {
      fontFamily: theme('fontFamily.mono'),
      fontSize: fontSizeValue(theme('fontSize.xs')),
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
        spacing: toCssVariableReferences(
          themes[defaultThemeName].spacing,
          'spacing',
        ),
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
