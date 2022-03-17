import { browser } from '$app/env';
import type { goto, invalidate } from '$app/navigation';
import { appendQueryParameters } from './append-query-parameters';

type UpdateQueryParams = {
  parameter: string;
  value?: string | number | boolean;
  url: URL;
  goto: typeof goto;
  invalidate?: typeof invalidate;
};

const options = { replaceState: true, keepfocus: true, noscroll: true };

export const updateQueryParameters = async ({
  parameter,
  value,
  url,
  goto,
}: UpdateQueryParams): Promise<typeof value> => {
  if (value) {
    url.searchParams.set(parameter, value.toString());
  } else {
    url.searchParams.delete(parameter);
  }

  if (browser) {
    goto(String(url), options);
  }

  return value;
};
