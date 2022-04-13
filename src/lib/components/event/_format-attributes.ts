import { formatDate } from '$lib/utilities/format-date';

type CombinedAttributes = EventAttribute & {
  eventTime?: string;
};

const keysToOmit: Readonly<Set<string>> = new Set(['header']);

export const formatAttributes = (
  event: IterableEvent,
  { compact } = { compact: false },
): CombinedAttributes => {
  const attributes: CombinedAttributes = {};

  if (compact) attributes.eventTime = formatDate(event.eventTime);

  for (const [key, value] of Object.entries(event.attributes)) {
    if (!keysToOmit.has(key)) attributes[key] = value;
  }

  return attributes;
};
