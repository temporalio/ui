import type { ColorAlpha } from './color-alpha-scales';

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const channel = (color: HexColor, offset: number): number =>
  Number.parseInt(color.slice(offset, offset + 2), 16);

const compositeChannel = (
  foreground: number,
  background: number,
  alpha: ColorAlpha,
): number =>
  Math.round((foreground * alpha + background * (100 - alpha)) / 100);

const hexChannel = (value: number): string =>
  value.toString(16).padStart(2, '0');

export const compositeColor = (
  foreground: HexColor,
  alpha: ColorAlpha,
  background: HexColor,
): HexColor => {
  if (
    !HEX_COLOR_PATTERN.test(foreground) ||
    !HEX_COLOR_PATTERN.test(background)
  ) {
    throw new Error('Colors must use six-digit hexadecimal notation');
  }

  const red = compositeChannel(
    channel(foreground, 1),
    channel(background, 1),
    alpha,
  );
  const green = compositeChannel(
    channel(foreground, 3),
    channel(background, 3),
    alpha,
  );
  const blue = compositeChannel(
    channel(foreground, 5),
    channel(background, 5),
    alpha,
  );

  return `#${hexChannel(red)}${hexChannel(green)}${hexChannel(blue)}`;
};
