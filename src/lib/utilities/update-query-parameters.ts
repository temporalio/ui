import { get } from 'svelte/store';

import { BROWSER } from 'esm-env';

import { invalidate, goto as navigateTo } from '$app/navigation';
import { page } from '$app/stores';

type UpdateQueryParams = {
  parameter: string;
  value?: string | number | boolean;
  url: URL;
  goto?: typeof navigateTo;
  allowEmpty?: boolean;
  invalidate?: typeof invalidate;
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
}: UpdateQueryParams): Promise<typeof value> => {
  const next = String(value);

  if (value) {
    url.searchParams.set(parameter, next);
  } else if (allowEmpty) {
    url.searchParams.set(parameter, '');
  } else {
    url.searchParams.delete(parameter);
  }

  if (BROWSER && url.href !== window.location.href) {
    const namespace = get(page)?.params?.namespace;
    const workflowsPath = `/namespaces/${namespace}/workflows`;

    if (url.pathname === workflowsPath) {
      await invalidate((url) => url.pathname === workflowsPath);
    }

    goto(url, gotoOptions);
  }

  return value;
};
