import type { goto, invalidate } from '$app/navigation';
import { appendQueryParameters } from './append-query-parameters';

type UpdateQueryParams = {
  parameter: string;
  value?: string;
  query: URLSearchParams;
  path: string;
  goto: typeof goto;
  invalidate?: typeof invalidate;
};

const options = { replaceState: true, keepfocus: true };

export const updateQueryParameters = ({
  parameter,
  value,
  query,
  path,
  goto,
}: UpdateQueryParams): void => {
  if (value) {
    query.set(parameter, value);
  } else {
    query.delete(parameter);
  }

  goto(appendQueryParameters(path, query), options);
};
