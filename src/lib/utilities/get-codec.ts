import { get } from 'svelte/store';
import {
  codecEndpoint,
  passAccessToken,
  passCredentials,
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
  return get(passToken) || settings?.codec?.passAccessToken;
};

export const getCodecPassCredentials = (
  settings: Settings,
  passCreds = passCredentials,
): boolean => {
  return get(passCreds) || settings?.codec?.passCredentials;
};
