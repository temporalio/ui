import { is_empty } from 'svelte/internal';

import { t, type TOptions } from 'i18next';

import { omit } from '$lib/utilities/omit';

import { type I18nKey, type I18nReplace, i18nResources } from '.';

export function translate(key: I18nKey, replace: I18nReplace = {}): string {
  const [namespace, ...keys] = key.split('.');
  const options: TOptions = {};

  if (replace && replace.count !== undefined) {
    options.count = replace.count;
  }

  if (!is_empty(omit(replace, 'count'))) {
    options.replace = omit(replace, 'count');
  }

  if (namespace && namespace in i18nResources && keys.length > 0) {
    const k = keys.join('.');
    return t(`${namespace}:${k}`, options);
  }
}
