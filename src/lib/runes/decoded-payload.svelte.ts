import { untrack } from 'svelte';

import type { Payload, Payloads } from '$lib/types';
import type { PayloadContainingObject } from '$lib/utilities/decode-payload';
import {
  type DecodedPayloadResult,
  decodePayloadResult,
} from '$lib/utilities/decode-payload-result';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

type DecodableValue = Payload | Payloads | PayloadContainingObject;

export type DecodedPayloadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; results: DecodedPayloadResult }
  | { status: 'error'; error: unknown; retry: () => void };

export function createDecodedPayload(
  getValue: () => DecodableValue | null | undefined,
) {
  let state = $state<DecodedPayloadState>({ status: 'idle' });
  let stateValueJson = $state<string>();
  let request = 0;
  const valueJson = $derived(stringifyWithBigInt(getValue()));

  const decode = async () => {
    const id = ++request;
    const value = untrack(getValue);
    stateValueJson = untrack(() => valueJson);
    if (!value) {
      state = { status: 'idle' };
      return;
    }

    state = { status: 'loading' };
    try {
      const results = await decodePayloadResult(value);
      if (id === request) state = { status: 'success', results };
    } catch (error) {
      if (id === request) state = { status: 'error', error, retry: decode };
    }
  };

  $effect(() => {
    void valueJson;
    decode();
    return () => {
      request++;
    };
  });

  return {
    get current(): DecodedPayloadState {
      if (stateValueJson === valueJson) return state;
      return getValue() ? { status: 'loading' } : { status: 'idle' };
    },
  };
}
