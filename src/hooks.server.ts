import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {});

  return response;
};

if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = function randomUUID() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
      const char = parseInt(c, 10);
      return (
        char ^
        ((crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (char / 4))
      ).toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}
