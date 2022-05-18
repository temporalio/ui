import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    // ssr: process.env.VITE_MODE !== 'test',
    ssr: false
  });

  return response;
};
