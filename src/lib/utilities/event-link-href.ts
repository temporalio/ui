import type { EventLink } from '$lib/types';

import { toEventLinkView } from './event-link';

export const getEventLinkHref = (link: EventLink): string => {
  return toEventLinkView(link).href ?? '';
};
