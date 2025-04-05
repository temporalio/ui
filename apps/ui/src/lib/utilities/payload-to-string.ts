import type { Payload } from '$lib/types';

export const payloadToString = (value: Payload) => {
  if (Array.isArray(value)) return value.join(', ');

  return value;
};
