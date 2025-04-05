import { get } from 'svelte/store';

import {
  codecEndpoint,
  includeCredentials,
  overrideRemoteCodecConfiguration,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type { Settings } from '$lib/types/global';

export const getCodecEndpoint = (
  settings: Settings,
  endpoint = codecEndpoint,
  override = overrideRemoteCodecConfiguration,
): string => {
  const overrideEndpoint = get(override) && get(endpoint);
  return overrideEndpoint || settings?.codec?.endpoint || get(endpoint) || '';
};

export const getCodecPassAccessToken = (
  settings: Settings,
  passToken = passAccessToken,
  endpoint = codecEndpoint,
  override = overrideRemoteCodecConfiguration,
): boolean => {
  const overrideEndpoint = get(override) && get(endpoint);
  const nonOverrideOption = settings?.codec?.endpoint
    ? !!settings?.codec?.passAccessToken
    : !!get(passToken);
  return overrideEndpoint ? !!get(passToken) : nonOverrideOption;
};

export const getCodecIncludeCredentials = (
  settings: Settings,
  includeCreds = includeCredentials,
  endpoint = codecEndpoint,
  override = overrideRemoteCodecConfiguration,
): boolean => {
  const overrideEndpoint = get(override) && get(endpoint);
  const nonOverrideOption = settings?.codec?.endpoint
    ? !!settings?.codec?.includeCredentials
    : !!get(includeCreds);
  return overrideEndpoint ? !!get(includeCreds) : nonOverrideOption;
};
