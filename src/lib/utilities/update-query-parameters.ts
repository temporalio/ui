import { BROWSER } from 'esm-env';

import { goto as navigateTo } from '$app/navigation';

type UpdateQueryParams = {
  parameter: string;
  value?: string | number | boolean;
  url: URL;
  goto?: typeof navigateTo;
  allowEmpty?: boolean;
  clearParameters?: string[];
};

export const gotoOptions = {
  keepFocus: true,
  noScroll: true,
};

export const updateQueryParameters = async ({
  parameter,
  value,
  url,
  goto = navigateTo,
  allowEmpty = false,
  clearParameters = [],
}: UpdateQueryParams): Promise<typeof value> => {
  const next = String(value);
  const params = {};
  url.searchParams.forEach((value, key) => {
    if (key !== parameter) {
      params[key] = value;
    }
  });
  const newQuery = new URLSearchParams(params);

  if (value) {
    newQuery.set(parameter, next);
  } else if (allowEmpty) {
    newQuery.set(parameter, '');
  }

  if (clearParameters.length) {
    clearParameters.forEach((parameter) => {
      newQuery.delete(parameter);
    });
  }

  if (BROWSER) {
    const query = newQuery?.toString();
    const newUrl = query ? `${url.pathname}?${query}` : url.pathname;

    goto(newUrl, gotoOptions);
  }

  return value;
};

export type QueryParameter = {
  parameter: string;
  value?: string | number | boolean;
};

type UpdateMultipleQueryParams = {
  parameters: QueryParameter[];
  url: URL;
  goto?: typeof navigateTo;
  clearParameters?: string[];
};

export const updateMultipleQueryParameters = async ({
  parameters,
  url,
  goto = navigateTo,
  clearParameters = [],
}: UpdateMultipleQueryParams) => {
  const params: { [key: string]: string } = {};
  url.searchParams.forEach((value, key) => {
    if (!parameters.find(({ parameter }) => parameter === key)) {
      params[key] = value;
    }
  });
  const newQuery = new URLSearchParams(params);

  parameters.forEach(({ parameter, value }) => {
    if (value || value === false) {
      newQuery.set(parameter, String(value));
    }
  });

  if (clearParameters.length) {
    clearParameters.forEach((parameter) => {
      newQuery.delete(parameter);
    });
  }

  if (BROWSER) {
    const query = newQuery?.toString();
    const newUrl = query ? `${url.pathname}?${query}` : url.pathname;

    goto(newUrl, gotoOptions);
  }
};
