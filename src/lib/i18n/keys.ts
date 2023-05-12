import type { keys } from './locales/en/common';

/**
 * https://www.i18next.com/translation-function/plurals#singular-plural
 * when translating strings that could be singular or plural, i.e. "0 Apples" or "1 Apple"
 * i18n expects the keys to be suffiex with `_zero`, `_one`, or `_other` for 0, 1, or n items.
 * If more suffixes are needed, i.e. `_few`, add them here.
 */
type WithoutPluralSufix<T> = T extends
  | `${infer P}_zero`
  | `${infer P}_one`
  | `${infer P}_other`
  ? P
  : T;

export type I18nKeys = {
  [K in keyof typeof keys as WithoutPluralSufix<K>]: string;
};

export type I18nKey = keyof I18nKeys;
