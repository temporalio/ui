import { colors, palette } from './colors';
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

export const toColor = (name: ColorName): RGB => {
  const [paletteColor, shade] = name.split('.') as [PaletteColor, Shade];
  const color = colors[paletteColor];
  if (isHexColor(color)) return rgb(color);
  if (isPaletteColor(paletteColor)) {
    const color = palette[paletteColor];
    if (isShade(shade)) return rgb(color[shade]);
    return rgb(color.DEFAULT);
  }
};

export const isHexColor = (color: unknown): color is HexColor => {
  if (typeof color !== 'string') return false;
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const isPaletteColor = (color: string): color is PaletteColor =>
  color in palette;

export const isShade = (shade: unknown): shade is Shade =>
  typeof shade === 'number' ||
  typeof Number(shade) === 'number' ||
  shade === 'DEFAULT';
