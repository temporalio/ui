import { join } from 'path';
import { readdirSync } from 'fs';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async () => {
  const files = readdirSync(join('src', 'routes', 'fiction', 'chapters'));
  const chapters = files
    .filter((file) => file.includes('.svelte'))
    .map((file) => file.split('.svelte')[0]);

  return {
    body: {
      chapters,
    },
  };
};
