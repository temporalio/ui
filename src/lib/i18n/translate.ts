import { t, type TOptions } from 'i18next';

import { isObject } from '$lib/utilities/is';

import { type I18nKey, I18nMap, type I18nNamespace, type I18nReplace } from '.';

// no namespace
export function translate(key: I18nKey<'common'>): string;
export function translate(key: I18nKey<'common'>, count?: number): string;
export function translate(
  key: I18nKey<'common'>,
  replace?: I18nReplace,
): string;
export function translate(
  key: I18nKey<'common'>,
  count?: number,
  replace?: I18nReplace,
): string;
// with namespace
export function translate<Namespace extends I18nNamespace>(
  namespace: Namespace,
  key: I18nKey<Namespace>,
): string;
export function translate<Namespace extends I18nNamespace>(
  namespace: Namespace,
  key: I18nKey<Namespace>,
  replace?: I18nReplace,
): string;
export function translate<Namespace extends I18nNamespace>(
  namespace: Namespace,
  key: I18nKey<Namespace>,
  count?: number,
): string;
export function translate<Namespace extends I18nNamespace>(
  namespace: Namespace,
  key: I18nKey<Namespace>,
  count?: number,
  replace?: I18nReplace,
): string;
export function translate<Namespace extends I18nNamespace>(
  namespaceOrKey: Namespace | I18nKey<'common'>,
  replaceCountOrKey?: I18nReplace | number | I18nKey<Namespace>,
  replaceOrCount?: I18nReplace | number,
  replaceOrUndef?: I18nReplace,
): string {
  let namespace: Namespace;
  let key: string;
  let count: number;
  let replace: I18nReplace;

  if (namespaceOrKey in I18nMap && typeof replaceCountOrKey === 'string') {
    namespace = namespaceOrKey as Namespace;
    key = replaceCountOrKey;
  } else {
    namespace = 'common' as Namespace;
    key = namespaceOrKey;
  }

  if (isObject(replaceCountOrKey)) {
    replace = replaceCountOrKey;
  } else if (typeof replaceCountOrKey === 'number') {
    count = replaceCountOrKey;
  }

  if (typeof replaceOrCount === 'number') {
    count = replaceOrCount;
  } else if (isObject(replaceOrCount)) {
    replace = replaceOrCount;
  }

  if (isObject(replaceOrUndef)) {
    replace = replaceOrUndef;
  }

  const options: TOptions = {
    ...(count !== undefined && { count }),
    ...(replace && { replace }),
  };

  return t(`${namespace}:${key}`, options);
}

class Translate<T extends I18nNamespace> {
  private namespace: T;
  constructor(namespace: T) {
    this.namespace = namespace;
  }

  public get translate() {
    return (
      key: I18nKey<T>,
      replaceOrCount?: I18nReplace | number,
      replaceOrUndef?: I18nReplace,
    ) =>
      translate.call(
        undefined,
        this.namespace,
        key,
        replaceOrCount,
        replaceOrUndef,
      );
  }
}

export const createTranslate = <T extends I18nNamespace>(namespace: T) => {
  const { translate } = new Translate<T>(namespace);

  return translate;
};
