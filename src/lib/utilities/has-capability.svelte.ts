import { page } from '$app/state';

import type { Capabilities } from '$lib/types';

export const hasCapability = (capability: keyof Capabilities): boolean =>
  Boolean(page.data?.systemInfo?.capabilities?.[capability]);
