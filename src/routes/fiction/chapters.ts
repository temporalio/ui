import { join } from 'path';
import { readdirSync } from 'fs';

export async function get() {
  const files = readdirSync(join('src', 'routes', 'fiction', 'chapters'));

  return {
    status: 200,
    body: {
      chapters: files
        .filter((file) => file.includes('.svelte'))
        .map((file) => file.split('.svelte')[0]),
    },
  };
}
