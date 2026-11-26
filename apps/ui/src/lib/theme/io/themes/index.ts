import { darkTheme } from './theme-dark';
import { lightTheme } from './theme-light';
import type {
  CssVariableReferences,
  CssVariables,
  CssVariablesFor,
  IoTheme,
} from './types';

export { colorAlphaScales, colorScales } from './primitives';
export type {
  CssVariableReferences,
  CssVariables,
  CssVariablesFor,
  IoTheme,
} from './types';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} satisfies Readonly<Record<string, IoTheme>>;

export type ThemeName = keyof typeof themes;

export const defaultThemeName: ThemeName = 'light';

type CssVariableEntry = [name: string, value: string];

const toCssVariableEntries = (
  group: object,
  path: string[] = [],
): CssVariableEntry[] =>
  Object.entries(group).flatMap(([name, value]) => {
    const nextPath = [...path, name];

    return typeof value === 'string'
      ? [[`--${nextPath.join('-')}`, value]]
      : toCssVariableEntries(value, nextPath);
  });

export const toCssVariables = <
  Value extends object,
  Prefix extends string = '',
>(
  value: Value,
  prefix?: Prefix,
): CssVariablesFor<Value, Prefix> =>
  Object.fromEntries(
    toCssVariableEntries(value, prefix ? [prefix] : []),
  ) as CssVariablesFor<Value, Prefix>;

const toCssVariableReferenceObject = (
  group: object,
  path: string[] = [],
): object =>
  Object.fromEntries(
    Object.entries(group).map(([name, value]) => {
      const nextPath = [...path, name];

      return [
        name,
        typeof value === 'string'
          ? `var(--${nextPath.join('-')})`
          : toCssVariableReferenceObject(value, nextPath),
      ];
    }),
  );

export const toCssVariableReferences = <Value extends object>(
  value: Value,
  prefix?: string,
): CssVariableReferences<Value> =>
  toCssVariableReferenceObject(
    value,
    prefix ? [prefix] : [],
  ) as CssVariableReferences<Value>;

export const ioThemeToCssVariables = (theme: IoTheme): CssVariables =>
  toCssVariables(theme);

export const themesBaseStyles = Object.fromEntries(
  Object.entries(themes).map(([name, theme]) => [
    name === defaultThemeName
      ? `:root, [data-theme="${name}"]`
      : `[data-theme="${name}"]`,
    ioThemeToCssVariables(theme),
  ]),
);
