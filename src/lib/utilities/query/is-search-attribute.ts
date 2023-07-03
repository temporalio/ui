import { get } from 'svelte/store';

import { searchAttributes } from '$lib/stores/search-attributes';

import { isString } from '../is';

export const isSearchAttribute = (
  attribute: string,
  attributes = searchAttributes,
): attribute is string => {
  if (!isString(attribute)) return false;
  return !!get(attributes)[attribute];
};
