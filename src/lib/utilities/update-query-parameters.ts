import { browser } from '$app/env';
import type { goto, invalidate } from '$app/navigation';
import { appendQueryParameters } from './append-query-parameters';

type UpdateQueryParams = {
  parameter: string;
  value?: string | number;
  query: URLSearchParams;
  path: string;
  goto: typeof goto;
  invalidate?: typeof invalidate;
};

const options = { replaceState: true, keepfocus: true, noscroll: true };

const hasChanged = (previous: URLSearchParams, next: URLSearchParams) => {
  const p = previous.toString();
  const n = next.toString();

  console.log('isSame?', previous.toString(), next.toString(), p === n);

  return p !== n;
};

export const updateQueryParameters = async ({
  parameter,
  value,
  query,
  path,
  goto,
}: UpdateQueryParams): Promise<typeof value> => {
  const updateSearchParams = new URLSearchParams(query);

  if (value) {
    updateSearchParams.set(parameter, value.toString());
  } else {
    updateSearchParams.delete(parameter);
  }

  if (hasChanged(query, updateSearchParams)) return value;

  if (browser) {
    goto(appendQueryParameters(path, query), options);
  }

  return value;
};
