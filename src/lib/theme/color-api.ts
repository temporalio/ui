import { colorAlphaScales } from './io/color-alpha-scales';
import { colorScales } from './io/color-scales';
import { type SemanticColor, semanticColors } from './io/semantic-colors';

type SemanticColorGroup = Readonly<Record<string, SemanticColor>>;

export interface ColorThemeGroup {
  readonly [name: string]: ColorThemeValue;
}

export type ColorThemeValue = string | ColorThemeGroup;

const referenceColorGroup = (group: string, colors: SemanticColorGroup) =>
  Object.fromEntries(
    Object.keys(colors).map((name) => [name, `var(--color-${group}-${name})`]),
  );

const resolveSemanticColors = (mode: keyof SemanticColor) =>
  Object.fromEntries(
    Object.entries(semanticColors).flatMap(([group, colors]) =>
      Object.entries(colors).map(([name, color]) => [
        `--color-${group}-${name}`,
        color[mode],
      ]),
    ),
  );

const keywordColors = {
  inherit: 'inherit',
  current: 'currentColor',
  transparent: 'transparent',
};

const contentColorReferences = referenceColorGroup(
  'content',
  semanticColors.content,
);
const {
  black: fixedBlack,
  white: fixedWhite,
  ...contentColors
} = contentColorReferences;
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

const semanticColorReferences = {
  background: referenceColorGroup('background', semanticColors.background),
  content: contentColors,
  surface: referenceColorGroup('surface', semanticColors.surface),
  border: referenceColorGroup('border', semanticColors.border),
  interactive: referenceColorGroup('interactive', semanticColors.interactive),
  actions: referenceColorGroup('actions', semanticColors.actions),
  overlay: referenceColorGroup('overlay', semanticColors.overlay),
};

const {
  background: backgroundColors,
  border: borderColors,
  interactive: interactiveColors,
} = semanticColorReferences;

export const fixedColorNames = Object.keys(fixedColors);

export const lightSemanticColorVariables = resolveSemanticColors('light');
export const darkSemanticColorVariables = resolveSemanticColors('dark');
export const semanticColorVariableNames = Object.keys(
  lightSemanticColorVariables,
);

export const colorTheme = {
  colors: keywordColors,
  accentColor: {
    ...basePaintColors,
    auto: 'auto',
  },
  backgroundColor: {
    ...basePaintColors,
    background: backgroundColors,
    surface: semanticColorReferences.surface,
    interactive: interactiveColors,
    action: semanticColorReferences.actions,
    overlay: semanticColorReferences.overlay,
    content: contentColors,
    border: borderColors,
  },
  borderColor: {
    ...basePaintColors,
    ...borderColors,
    interactive: interactiveColors,
    content: contentColors,
  },
  boxShadowColor: {
    ...basePaintColors,
    content: contentColors,
  },
  caretColor: {
    ...basePaintColors,
    ...contentColors,
  },
  divideColor: {
    ...basePaintColors,
    ...borderColors,
  },
  fill: {
    ...basePaintColors,
    none: 'none',
    ...contentColors,
  },
  gradientColorStops: {
    ...basePaintColors,
    ...semanticColorReferences,
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
    none: 'none',
  },
  textColor: {
    ...basePaintColors,
    ...contentColors,
  },
  textDecorationColor: {
    ...basePaintColors,
    ...contentColors,
  },
} satisfies Readonly<Record<string, ColorThemeValue>>;
