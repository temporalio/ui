import { get } from 'svelte/store';
import {
  codecEndpoint,
  passAccessToken,
} from '$lib/stores/data-encoder-config';

export const getCodecEndpoint = (
  settings: Settings,
  endpoint = codecEndpoint,
): string => {
  return get(endpoint) || settings?.codec?.endpoint || '';
};

export const getCodecPassAccessToken = (
  settings: Settings,
  passToken = passAccessToken,
): boolean => {
  return !!get(passToken) || !!settings?.codec?.passAccessToken;
};
