import { palette } from './colors';
import type { Variable } from './variables';

const removeHexPrefix = (hex: HexColor) => hex.replace('#', '');

export const rgb = (hexColor: HexColor): RGB => {
  let hex = removeHexPrefix(hexColor);
  hex = hex.length === 3 ? hex.replace(/./g, '$&$&') : hex;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export const css = (variable: Variable) => `rgb(var(${variable}))`;

export const getColor = (
  color: PaletteColor | HexColor,
  shade: Shade = 'DEFAULT',
): HexColor => {
  if (isHexColor(color)) return color;
  return palette[color][shade];
};

export const getRGB = (color: Color): RGB => {
  if (isHexColor(color)) return rgb(color);
  const [paletteColor, shade] = color;
  return rgb(getColor(paletteColor, shade));
};

export const toColor = ({
  light,
  dark,
}: {
  light: Color;
  dark: Color;
}): { light: RGB; dark: RGB } => {
  return { light: getRGB(light), dark: getRGB(dark) };
};

export const isHexColor = (color: unknown): color is HexColor => {
  if (typeof color !== 'string') return false;
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const isPaletteColor = (color: string): color is PaletteColor =>
  color in palette;
