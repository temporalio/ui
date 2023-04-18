import { get } from 'svelte/store';
import {
  codecEndpoint,
  passAccessToken,
  includeCredentials,
} from '$lib/stores/data-encoder-config';
import type { Settings } from '$lib/types/global';

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

export const getCodecIncludeCredentials = (
  settings: Settings,
  includeCreds = includeCredentials,
): boolean => {
  return get(includeCreds) || settings?.codec?.includeCredentials;
};
