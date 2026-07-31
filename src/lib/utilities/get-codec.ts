import { get } from 'svelte/store';

import {
  codecEndpoint,
  includeCredentials,
  overrideRemoteCodecConfiguration,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import type { Settings } from '$lib/types/global';

type CodecSettings = { codec?: Settings['codec'] };

export const getCodecEndpoint = (
  settings: CodecSettings,
  endpoint = codecEndpoint,
  override = overrideRemoteCodecConfiguration,
): string => {
  const overrideEndpoint = get(override) && get(endpoint);
  return overrideEndpoint || settings?.codec?.endpoint || '';
};

export const getCodecPassAccessToken = (
  settings: CodecSettings,
  passToken = passAccessToken,
  endpoint = codecEndpoint,
  override = overrideRemoteCodecConfiguration,
): boolean => {
  const overrideEndpoint = get(override) && get(endpoint);
  return overrideEndpoint
    ? !!get(passToken)
    : !!settings?.codec?.passAccessToken;
};

export const getCodecIncludeCredentials = (
  settings: CodecSettings,
  includeCreds = includeCredentials,
  endpoint = codecEndpoint,
  override = overrideRemoteCodecConfiguration,
): boolean => {
  const overrideEndpoint = get(override) && get(endpoint);
  return overrideEndpoint
    ? !!get(includeCreds)
    : !!settings?.codec?.includeCredentials;
};
