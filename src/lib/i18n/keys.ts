import type ENKeys from './locales/en/common';
import type FRKeys from './locales/fr/common';
import type DEKeys from './locales/de/common';

/**
 * https://www.i18next.com/translation-function/plurals#singular-plural
 * when translating strings that could be singular or plural, i.e. "0 Apples" or "1 Apple"
 * i18next expects the keys to be suffixed with `_zero`, `_one`, or `_other` for 0, 1, or n > 1 items respectively.
 * If more suffixes are needed, i.e. `_few`, add them here.
 */
type WithoutPluralSufix<T> = T extends
  | `${infer P}_zero`
  | `${infer P}_one`
  | `${infer P}_other`
  ? P
  : T;

type AllKeys = typeof ENKeys & typeof FRKeys & typeof DEKeys;

export type I18nKeys = {
  [K in keyof AllKeys as WithoutPluralSufix<K>]: string;
};

export type I18nKey = keyof I18nKeys;
