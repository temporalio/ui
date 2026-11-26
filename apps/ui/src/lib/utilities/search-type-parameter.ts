import { isString } from './is';

type SearchType = 'basic' | 'advanced';

export const isValidSearchType = (
  parameter: unknown,
): parameter is SearchType => {
  if (!isString(parameter)) return false;
  if (parameter === 'basic') return true;
  if (parameter === 'advanced') return true;
  return false;
};

export const getSearchType = (url: URL): SearchType => {
  const searchType = url.searchParams.get('search');

  if (isValidSearchType(searchType)) return searchType;

  url.searchParams.set('search', 'basic');

  return 'basic';
};
