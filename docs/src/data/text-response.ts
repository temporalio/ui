import { DEV } from 'esm-env';

export const docsOrigin = (url: URL) => (DEV ? url.origin : '');

export const textResponse = (body: string, type = 'text/plain') =>
  new Response(body, {
    headers: { 'content-type': `${type}; charset=utf-8` },
  });
