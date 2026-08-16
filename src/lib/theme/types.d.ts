type PaletteColor = import('./colors').PaletteColor;
type Palette = import('./colors').Palette;

type RGB = `${number} ${number} ${number}`;
type HexColor = `#${string}`;

type ColorCSSVariable = `--color-${string}`;
type ColorScheme = 'light' | 'dark';
type ColorVariableValue = Readonly<Record<ColorScheme, ColorName>>;
type ColorVariables = Readonly<Record<ColorCSSVariable, ColorVariableValue>>;

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
