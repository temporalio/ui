import { browser } from '$app/env';

export function getApiOrigin(): string | null {
  const isRelative = !import.meta.env.VITE_API.startsWith('http');

  let origin = '';

  if (isRelative) {
    origin = browser ? window.location.origin : '';
  } else {
    origin = import.meta.env.VITE_API;
  }

  if (origin.endsWith('/')) origin = origin.slice(0, -1);

  return origin;
}
