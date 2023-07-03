import * as Common from './locales/en/common';
import * as Events from './locales/en/events';
import * as TypedErrors from './locales/en/typed-errors';
import * as Workflows from './locales/en/workflows';

/**
 * https://www.i18next.com/translation-function/plurals#singular-plural
 * when translating strings that could be singular or plural, i.e. "0 Apples" or "1 Apple"
 * i18next expects the keys to be suffixed with `_zero`, `_one`, or `_other` for 0, 1, or n > 1 items respectively.
 * If more suffixes are needed, i.e. `_few`, add them here.
 */
type WithoutPluralSuffix<T> = T extends
  | `${infer P}_zero`
  | `${infer P}_one`
  | `${infer P}_other`
  ? P
  : T;

export const I18nMap = {
  [Common.Namespace]: Common.Strings,
  [Workflows.Namespace]: Workflows.Strings,
  [TypedErrors.Namespace]: TypedErrors.Strings,
  [Events.Namespace]: Events.Strings,
} as const;

export const I18nNamespaces = Object.keys(I18nMap);

export type I18nNamespace = keyof typeof I18nMap;

export type I18nKeys = {
  [K in keyof typeof I18nMap]: {
    [T in keyof (typeof I18nMap)[K] as WithoutPluralSuffix<T>]: (typeof I18nMap)[K][T];
  };
};

export type I18nKey<T extends I18nNamespace> = keyof I18nKeys[T];

// TODO: can we make this dynamic based on the namespace and key?
export type I18nReplace = {
  count?: number;
  [index: string]: string | number;
};
