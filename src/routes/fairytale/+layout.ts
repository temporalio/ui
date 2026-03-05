import { error } from '@sveltejs/kit';

import '../../app.css';

export const load = () => {
  if (!import.meta.env.DEV) {
    error(404, 'Not found');
  }
};
