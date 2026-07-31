import type { Payload } from '$lib/types';

export const payloadToString = (value: Payload | string | string[]) => {
  if (Array.isArray(value)) return value.join(', ');

  return value;
};
