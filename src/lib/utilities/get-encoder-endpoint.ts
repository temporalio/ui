import { get } from 'svelte/store';
import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';

export const getEncoderEndpoint = (
  settings: Settings,
  encoderEndpoint = dataEncoderEndpoint,
): string => {
  return get(encoderEndpoint) || settings?.codec?.endpoint || '';
};
