import { goto } from '$app/navigation';

import type { ResolvedRoute } from './route-for';

export function gotoResolved(
  url: ResolvedRoute,
  opts?: Parameters<typeof goto>[1],
): ReturnType<typeof goto> {
  // eslint-disable-next-line svelte/no-navigation-without-resolve
  return goto(url, opts);
}
