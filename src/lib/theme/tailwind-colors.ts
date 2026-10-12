import {
  colorAlphaScales,
  colorScales,
  defaultThemeName,
  themes,
  toCssVariableReferences,
} from './io/themes';

export interface ColorThemeGroup {
  readonly [name: string]: ColorThemeValue;
}

export type ColorThemeValue = string | ColorThemeGroup;

const defaultTheme = themes[defaultThemeName];
const colorReferences = toCssVariableReferences(defaultTheme.color, 'color');

const {
  action: actionColors,
  extension: extensionColors,
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
  extension: extensionColors,
};

export const colorTheme = {
  colors: keywordColors,
  accentColor: {
    ...basePaintColors,
    action: actionColors,
    extension: extensionColors,
    auto: 'auto',
  },
  backgroundColor: {
    ...basePaintColors,
    ...semanticColors,
  },
  borderColor: {
    DEFAULT: borderColors.primary,
    ...basePaintColors,
    ...borderColors,
    interactive: interactiveColors,
    action: actionColors,
    extension: extensionColors,
    content: contentColors,
  },
  boxShadowColor: {
    ...basePaintColors,
    action: actionColors,
    extension: extensionColors,
    content: contentColors,
  },
  caretColor: {
    ...basePaintColors,
    ...contentColors,
    action: actionColors,
    extension: extensionColors,
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
    extension: extensionColors,
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
    extension: extensionColors,
    none: 'none',
  },
  textColor: {
    ...basePaintColors,
    ...contentColors,
    action: actionColors,
    extension: extensionColors,
  },
  textDecorationColor: {
    ...basePaintColors,
    ...contentColors,
    action: actionColors,
    extension: extensionColors,
  },
} satisfies Readonly<Record<string, ColorThemeValue>>;
