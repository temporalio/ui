import type { PageLoad } from './$types';

export const load: PageLoad = ({ depends }) => {
  depends('data:deployment');
};
