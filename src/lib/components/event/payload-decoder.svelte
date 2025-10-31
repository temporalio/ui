<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import { page } from '$app/stores';

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

  interface Props {
    value: PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo;
    key?: string;
    onDecode?: (decodedValue: string) => void;
    children: Snippet<[decodedValue: string]>;
    error?: Snippet<[retry: () => Promise<string>, err: unknown]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    loading?: Snippet<[keyedVal: any]>;
  }

  let { children, value, key = '', onDecode, error, loading }: Props = $props();

  let keyedValue = key && value?.[key] ? value[key] : value;

  let decodeValuePromise = $state<Promise<string> | null>(null);

  onMount(() => {
    decodeValuePromise = decodePayloads(value);
  });

  const decodePayloads = async (
    _value: PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
  ) => {
    const settings = {
      ...$page.data.settings,
      codec: {
        ...$page.data.settings?.codec,
        endpoint: getCodecEndpoint($page.data.settings),
        passAccessToken: getCodecPassAccessToken($page.data.settings),
        includeCredentials: getCodecIncludeCredentials($page.data.settings),
      },
    };
    try {
      const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
        _value,
        $page.params.namespace,
        settings,
        $authUser.accessToken,
      );
      const decodedAttributes = decodePayloadAttributes(
        convertedAttributes,
      ) as object;
      const keyExists = key && decodedAttributes?.[key];
      let finalValue = keyExists ? decodedAttributes[key] : decodedAttributes;
      if (Array.isArray(finalValue) && finalValue.length === 1) {
        finalValue = finalValue[0];
      }
      let decodedValue = stringifyWithBigInt(finalValue);
      if (onDecode) {
        onDecode(decodedValue);
      }
      return decodedValue;
    } catch (e) {
      console.error('Could not decode payloads');
    }
  };
</script>

{#await decodeValuePromise}
  {@render loading?.(keyedValue)}
{:then decoded}
  {@render children(decoded)}
{:catch err}
  {@render error?.(() => decodePayloads(value), err)}
{/await}
