import plugin from 'tailwindcss/plugin';

import { colorAlphaScales } from './io/color-alpha-scales';
import { colorScales } from './io/color-scales';
import { type SemanticColor, semanticColors } from './io/semantic-colors';

type SemanticColorGroup = Readonly<Record<string, SemanticColor>>;

const referenceColorGroup = (group: string, colors: SemanticColorGroup) =>
  Object.fromEntries(
    Object.keys(colors).map((name) => [
      name,
      `var(--color-io-${group}-${name})`,
    ]),
  );

const resolveColorGroup = (
  group: string,
  colors: SemanticColorGroup,
  mode: keyof SemanticColor,
) =>
  Object.fromEntries(
    Object.entries(colors).map(([name, color]) => [
      `--color-io-${group}-${name}`,
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

const ioColors = {
  ...colorScales,
  alpha: colorAlphaScales,
  background: referenceColorGroup('background', semanticColors.background),
  content: referenceColorGroup('content', semanticColors.content),
  surface: referenceColorGroup('surface', semanticColors.surface),
  border: referenceColorGroup('border', semanticColors.border),
  interactive: referenceColorGroup('interactive', semanticColors.interactive),
  actions: referenceColorGroup('actions', semanticColors.actions),
  overlay: referenceColorGroup('overlay', semanticColors.overlay),
};

const ioLight = resolveSemanticColors('light');
const ioDark = resolveSemanticColors('dark');

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
    addBase({
      ':root': ioLight,
      '[data-theme="dark"]': ioDark,
    });
  },
  {
    theme: {
      colors: {
        inherit: 'inherit',
        current: 'currentColor',
        transparent: 'transparent',
        io: ioColors,
      },
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
export { textStyles };
