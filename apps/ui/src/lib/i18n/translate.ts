import { t, type TOptions } from 'i18next';

import type { I18nKey, I18nReplace, I18nResources } from '.';

const translateGeneric = <R>(
  key: I18nKey<R>,
  { escapeValue, ...replace }: I18nReplace = {},
): string => {
  const [namespace, ...keys] = key.split('.');

  if (namespace && keys.length > 0) {
    const k = keys.join('.');
    const options: TOptions = { ...replace };
    if (escapeValue !== undefined) {
      options.interpolation = { escapeValue };
    }
    return t(`${namespace}:${k}`, options);
  }

  return key;
};

export const createTranslate = <R>() => {
  return translateGeneric<R>;
};

export const translate = createTranslate<I18nResources>();
