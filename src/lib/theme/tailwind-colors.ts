import {
  colorAlphaScales,
  colorScales,
  defaultThemeName,
  themes,
  toCssVariableReferences,
  toCssVariables,
} from './io/themes';

export interface ColorThemeGroup {
  readonly [name: string]: ColorThemeValue;
}

export type ColorThemeValue = string | ColorThemeGroup;

const defaultTheme = themes[defaultThemeName];
const colorReferences = toCssVariableReferences(defaultTheme.color, 'color');

const {
  action: actionColors,
  background: backgroundColors,
  border: borderColors,
  content: { black: fixedBlack, white: fixedWhite, ...contentColors },
  interactive: interactiveColors,
  surface: surfaceColors,
} = colorReferences;

export const opacityTheme = toCssVariableReferences(
  defaultTheme.opacity,
  'opacity',
);
export const semanticColorVariableNames = Object.keys(
  toCssVariables(defaultTheme.color, 'color'),
);

const keywordColors = {
  inherit: 'inherit',
  current: 'currentColor',
  transparent: 'transparent',
};
const fixedColors = {
  black: fixedBlack,
  white: fixedWhite,
};
const paintColors = {
  ...colorScales,
  alpha: colorAlphaScales,
  ...fixedColors,
};
const basePaintColors = {
  ...keywordColors,
  ...paintColors,
};
const semanticColors = {
  background: backgroundColors,
  content: contentColors,
  surface: surfaceColors,
  border: borderColors,
  interactive: interactiveColors,
  action: actionColors,
};

export const fixedColorNames = Object.keys(fixedColors);

export const colorTheme = {
  colors: keywordColors,
  accentColor: {
    ...basePaintColors,
    action: actionColors,
    auto: 'auto',
  },
  backgroundColor: {
    ...basePaintColors,
    ...semanticColors,
  },
  borderColor: {
    ...basePaintColors,
    ...borderColors,
    interactive: interactiveColors,
    action: actionColors,
    content: contentColors,
  },
  boxShadowColor: {
    ...basePaintColors,
    action: actionColors,
    content: contentColors,
  },
  caretColor: {
    ...basePaintColors,
    ...contentColors,
    action: actionColors,
  },
  divideColor: {
    ...basePaintColors,
    ...borderColors,
  },
  fill: {
    ...basePaintColors,
    none: 'none',
    ...contentColors,
    action: actionColors,
  },
  gradientColorStops: {
    ...basePaintColors,
    ...semanticColors,
  },
  outlineColor: {
    ...basePaintColors,
    ...borderColors,
    interactive: interactiveColors,
  },
  placeholderColor: {
    ...basePaintColors,
    ...contentColors,
  },
  ringColor: {
    DEFAULT: interactiveColors.primary,
    ...basePaintColors,
    ...borderColors,
    interactive: interactiveColors,
  },
  ringOffsetColor: {
    DEFAULT: backgroundColors.primary,
    ...basePaintColors,
    background: backgroundColors,
  },
  stroke: {
    ...basePaintColors,
    action: actionColors,
    none: 'none',
  },
  textColor: {
    ...basePaintColors,
    ...contentColors,
    action: actionColors,
  },
  textDecorationColor: {
    ...basePaintColors,
    ...contentColors,
    action: actionColors,
  },
} satisfies Readonly<Record<string, ColorThemeValue>>;
