import type { goto, invalidate } from '$app/navigation';

type UpdateQueryParams = {
  parameter: string;
  value: string;
  query: URLSearchParams;
  path: string;
  goto: typeof goto;
  invalidate?: typeof invalidate;
};

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
  goto(`${path}?${query}`, { replaceState: true, keepfocus: true });
};
