import { get } from 'svelte/store';

import { page } from '$app/state';

import { authUser } from '$lib/stores/auth-user';
import type { Memo } from '$lib/types';
import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
import {
  cloneAllPotentialPayloadsWithCodec,
  decodePayloadAttributes,
  type PotentiallyDecodable,
} from '$lib/utilities/decode-payload';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from '$lib/utilities/get-codec';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export const decodePayloads = async (
  value: PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
  key: string | undefined,
) => {
  const settings = {
    ...page.data.settings,
    codec: {
      ...page.data.settings?.codec,
      endpoint: getCodecEndpoint(page.data.settings),
      passAccessToken: getCodecPassAccessToken(page.data.settings),
      includeCredentials: getCodecIncludeCredentials(page.data.settings),
    },
  };
  try {
    const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
      value,
      page.params.namespace,
      settings,
      get(authUser).accessToken,
    );
    const decodedAttributes = decodePayloadAttributes(
      convertedAttributes,
    ) as object;
    const keyExists = key && decodedAttributes?.[key];
    let finalValue = keyExists ? decodedAttributes[key] : decodedAttributes;
    if (Array.isArray(finalValue) && finalValue.length === 1) {
      finalValue = finalValue[0];
    }
    if (typeof finalValue === 'string') {
      try {
        return JSON.stringify(JSON.parse(finalValue), null, 2);
      } catch (e) {
        return finalValue;
      }
    } else {
      return stringifyWithBigInt(finalValue);
    }
  } catch (e) {
    console.error('Could not decode payloads');
    return stringifyWithBigInt(key ? value[key] : value);
  }
};
