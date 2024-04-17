import { t } from 'i18next';

import type { I18nKey, I18nReplace, I18nResources } from '.';

const translateGeneric = <R>(
  key: I18nKey<R>,
  replace: I18nReplace = {},
): string => {
  const [namespace, ...keys] = key.split('.');

  if (namespace && keys.length > 0) {
    const k = keys.join('.');
    return t(`${namespace}:${k}`, replace);
  }
};

export const createTranslate = <R>() => {
  return translateGeneric<R>;
};

export const translate = createTranslate<I18nResources>();
