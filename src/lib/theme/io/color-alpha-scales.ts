import { type ColorScaleName, colorScales } from './color-scales';

export type ColorAlpha =
  | 5
  | 10
  | 15
  | 20
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100;

export type ColorAlphaScale = Record<ColorAlpha, string>;

const withAlpha = (color: `#${string}`, alpha: ColorAlpha): string =>
  alpha === 100 ? color : `color-mix(in srgb, ${color} ${alpha}%, transparent)`;

const colorAlphaScale = (color: `#${string}`): ColorAlphaScale => ({
  5: withAlpha(color, 5),
  10: withAlpha(color, 10),
  15: withAlpha(color, 15),
  20: withAlpha(color, 20),
  30: withAlpha(color, 30),
  40: withAlpha(color, 40),
  50: withAlpha(color, 50),
  60: withAlpha(color, 60),
  70: withAlpha(color, 70),
  80: withAlpha(color, 80),
  90: withAlpha(color, 90),
  100: withAlpha(color, 100),
});

export const colorAlphaScales = {
  amber: colorAlphaScale(colorScales.amber[9]),
  blue: colorAlphaScale(colorScales.blue[9]),
  'dark-magenta': colorAlphaScale(colorScales['dark-magenta'][9]),
  green: colorAlphaScale(colorScales.green[9]),
  indigo: colorAlphaScale(colorScales.indigo[9]),
  neutral: colorAlphaScale(colorScales.neutral[9]),
  olive: colorAlphaScale(colorScales.olive[9]),
  'peacock-blue': colorAlphaScale(colorScales['peacock-blue'][9]),
  persimmon: colorAlphaScale(colorScales.persimmon[9]),
  pink: colorAlphaScale(colorScales.pink[9]),
  purple: colorAlphaScale(colorScales.purple[9]),
  red: colorAlphaScale(colorScales.red[9]),
  slate: colorAlphaScale(colorScales.slate[9]),
  'slate-blue': colorAlphaScale(colorScales['slate-blue'][9]),
  tangerine: colorAlphaScale(colorScales.tangerine[9]),
  zaffre: colorAlphaScale(colorScales.zaffre[9]),
} satisfies Record<ColorScaleName, ColorAlphaScale>;
