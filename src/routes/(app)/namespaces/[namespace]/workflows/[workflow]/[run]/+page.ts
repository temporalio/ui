import { redirect } from '@sveltejs/kit';
import { BROWSER } from 'esm-env';

import type { PageLoad } from './$types';

import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

export const load: PageLoad = async function ({ url }) {
  let tab = 'timeline';
  if (BROWSER) {
    try {
      const stored = parseWithBigInt(
        localStorage.getItem('preferredWorkflowTab') ?? '"timeline"',
      );
      if (stored === 'history' || stored === 'timeline') {
        tab = stored;
      }
    } catch {
      // Invalid stored value, use default
    }
  }
  redirect(302, `${url.pathname}/${tab}`);
};
