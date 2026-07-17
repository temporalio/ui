import type { Leaves } from '$lib/types/global';

import Locales from './locales';

/**
 * https://www.i18next.com/translation-function/plurals#singular-plural
 * when translating strings that could be singular or plural, i.e. "0 Apples" or "1 Apple"
 * i18next expects the keys to be suffixed with the CLDR plural category, e.g.
 * `_zero`, `_one`, `_other` for cardinals.
 *
 * Ordinal plurals (https://www.i18next.com/translation-function/plurals#ordinal-plurals)
 * are resolved with `{ count, ordinal: true }`. In i18next v22 they share the same
 * category suffixes (`_one`, `_two`, `_few`, `_other`) rather than an `_ordinal_*` form.
 */
type WithoutPluralSuffix<T> = T extends
  | `${infer P}_zero`
  | `${infer P}_one`
  | `${infer P}_two`
  | `${infer P}_few`
  | `${infer P}_many`
  | `${infer P}_other`
  ? P
  : T;

export const i18nNamespaces = Object.keys(Locales.en);

export type I18nResources = typeof Locales.en;

export type I18nKey<Resources = I18nResources> = WithoutPluralSuffix<
  Leaves<{
    [Key in keyof Resources]: Resources[Key];
  }>
>;

// TODO: can we make this dynamic based on the namespace and key?
export type I18nReplace = {
  count?: number;
  ordinal?: boolean;
  [index: string]: string | number | boolean | undefined;
};
