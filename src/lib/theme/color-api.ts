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

const resolveColorGroup = (
  group: string,
  colors: SemanticColorGroup,
  mode: keyof SemanticColor,
) =>
  Object.fromEntries(
    Object.entries(colors).map(([name, color]) => [
      `--color-${group}-${name}`,
      color[mode],
    ]),
  );

const resolveSemanticColors = (mode: keyof SemanticColor) => ({
  ...resolveColorGroup('background', semanticColors.background, mode),
  ...resolveColorGroup('content', semanticColors.content, mode),
  ...resolveColorGroup('surface', semanticColors.surface, mode),
  ...resolveColorGroup('border', semanticColors.border, mode),
  ...resolveColorGroup('interactive', semanticColors.interactive, mode),
  ...resolveColorGroup('actions', semanticColors.actions, mode),
  ...resolveColorGroup('overlay', semanticColors.overlay, mode),
});

const keywordColors = {
  inherit: 'inherit',
  current: 'currentColor',
  transparent: 'transparent',
};

const primitiveColors = {
  ...colorScales,
  alpha: colorAlphaScales,
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
  ...primitiveColors,
  ...fixedColors,
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

const borderColors = semanticColorReferences.border;
const interactiveColors = semanticColorReferences.interactive;
const backgroundColors = semanticColorReferences.background;

export const fixedColorNames = Object.keys(fixedColors);

export const lightSemanticColorVariables = resolveSemanticColors('light');
export const darkSemanticColorVariables = resolveSemanticColors('dark');
export const semanticColorVariableNames = Object.keys(
  lightSemanticColorVariables,
);

export const colorTheme = {
  colors: keywordColors,
  accentColor: {
    ...keywordColors,
    ...paintColors,
    auto: 'auto',
  },
  backgroundColor: {
    ...keywordColors,
    ...paintColors,
    background: backgroundColors,
    surface: semanticColorReferences.surface,
    interactive: interactiveColors,
    action: semanticColorReferences.actions,
    overlay: semanticColorReferences.overlay,
    content: contentColors,
    border: borderColors,
  },
  borderColor: {
    ...keywordColors,
    ...paintColors,
    ...borderColors,
    interactive: interactiveColors,
    content: contentColors,
  },
  boxShadowColor: {
    ...keywordColors,
    ...paintColors,
    content: contentColors,
  },
  caretColor: {
    ...keywordColors,
    ...paintColors,
    ...contentColors,
  },
  divideColor: {
    ...keywordColors,
    ...paintColors,
    ...borderColors,
  },
  fill: {
    ...keywordColors,
    none: 'none',
    ...paintColors,
    ...contentColors,
  },
  gradientColorStops: {
    ...keywordColors,
    ...paintColors,
    ...semanticColorReferences,
  },
  outlineColor: {
    ...keywordColors,
    ...paintColors,
    ...borderColors,
    interactive: interactiveColors,
  },
  placeholderColor: {
    ...keywordColors,
    ...paintColors,
    ...contentColors,
  },
  ringColor: {
    DEFAULT: interactiveColors.primary,
    ...keywordColors,
    ...paintColors,
    ...borderColors,
    interactive: interactiveColors,
  },
  ringOffsetColor: {
    DEFAULT: backgroundColors.primary,
    ...keywordColors,
    ...paintColors,
    background: backgroundColors,
  },
  stroke: {
    ...keywordColors,
    none: 'none',
    ...paintColors,
  },
  textColor: {
    ...keywordColors,
    ...paintColors,
    ...contentColors,
  },
  textDecorationColor: {
    ...keywordColors,
    ...paintColors,
    ...contentColors,
  },
} satisfies Readonly<Record<string, ColorThemeValue>>;
