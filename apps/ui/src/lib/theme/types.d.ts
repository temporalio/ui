type PaletteColor = import('./colors').PaletteColor;
type Palette = import('./colors').Palette;

type RGB = `${number} ${number} ${number}`;
type HexColor = `#${string}`;

type CSSVariable = `--${string}`;
type ColorVariables = Readonly<
  Record<CSSVariable, { light: ColorName; dark: ColorName }>
>;

type Shade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950
  | 'DEFAULT';

type Shades = Record<Shade, HexColor>;

type Color = [PaletteColor, Shade | undefined] | HexColor;

type ColorName =
  | Exclude<keyof typeof import('./colors').colors, PaletteColor>
  | `${PaletteColor}.${Shade}`;
