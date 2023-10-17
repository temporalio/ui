import { is_empty } from 'svelte/internal';

import { t, type TOptions } from 'i18next';

import { omit } from '$lib/utilities/omit';

import type { I18nKey, I18nReplace, I18nResources } from '.';

const translateGeneric = <R>(
  key: I18nKey<R>,
  replace: I18nReplace = {},
): string => {
  const [namespace, ...keys] = key.split('.');
  const options: TOptions = {};

  if (replace && replace.count !== undefined) {
    options.count = replace.count;
  }

  if (!is_empty(omit(replace, 'count'))) {
    options.replace = omit(replace, 'count');
  }

  if (namespace && keys.length > 0) {
    const k = keys.join('.');
    return t(`${namespace}:${k}`, options);
  }
};

export const createTranslate = <R>() => {
  return translateGeneric<R>;
};

export const translate = createTranslate<I18nResources>();
