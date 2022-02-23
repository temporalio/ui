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

const options = { replaceState: true, keepfocus: true };

export const updateQueryParameters = async ({
  parameter,
  value,
  query,
  path,
  goto,
}: UpdateQueryParams): Promise<typeof value> => {
  if (value) {
    query.set(parameter, value.toString());
  } else {
    query.delete(parameter);
  }

  goto(appendQueryParameters(path, query), options);

  return value;
};
