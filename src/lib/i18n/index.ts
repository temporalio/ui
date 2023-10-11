import type { Leaves } from '$lib/types/global';

import Locales from './locales';

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
  ...Locales.en,
} as const;

export const I18nNamespaces = Object.keys(I18nMap);

export type I18nNamespace = keyof typeof I18nMap;

export type I18nKeys = {
  [Namespace in keyof typeof I18nMap]: {
    [Key in keyof (typeof I18nMap)[Namespace] as WithoutPluralSuffix<
      Leaves<(typeof I18nMap)[Namespace]>
    >]: (typeof I18nMap)[Namespace][Key];
  };
};

export type I18nKey<T extends I18nNamespace> = keyof I18nKeys[T];

// TODO: can we make this dynamic based on the namespace and key?
export type I18nReplace = {
  count?: number;
  [index: string]: string | number;
};
