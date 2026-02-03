// Remove this file when Standalone Activities is ready to release
import { error } from '@sveltejs/kit';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
  error(404);
};
