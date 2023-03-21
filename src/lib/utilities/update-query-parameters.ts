import { browser } from '$app/environment';
import { goto as navigateTo } from '$app/navigation';
import { invalidate } from '$app/navigation';
import { get } from 'svelte/store';
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
  replaceState: true,
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

  if (browser && url.href !== window.location.href) {
    const namespace = get(page)?.params?.namespace;
    if (url.pathname === `/namespaces/${namespace}/workflows`) {
      await invalidate(() => true);
    }
    goto(url, gotoOptions);
  }

  return value;
};
