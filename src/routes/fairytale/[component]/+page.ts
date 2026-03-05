import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { componentRegistry } from '$lib/holocene/fairytale-registry';

export const load: PageLoad = ({ params }) => {
  const key = params.component;

  if (!componentRegistry[key] || key === 'index') {
    error(404, 'Component not found');
  }

  return { componentKey: key };
};
