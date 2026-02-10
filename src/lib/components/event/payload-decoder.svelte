<script lang="ts">
  import { type Snippet } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
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
    loading?: Snippet<[keyedVal: string]>;
  }

  let {
    children,
    value,
    key = '',
    onDecode,
    error = errorSnip,
    loading = loadingSnip,
  }: Props = $props();

  let keyedValue = stringifyWithBigInt(
    key && value?.[key] ? value[key] : value,
  );

  let decodeValuePromise = $state<Promise<string>>(decodePayloads(value));

  async function decodePayloads(
    _value: PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
  ) {
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
        _value,
        page.params.namespace,
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
      // hmm before this just ate the error we want to throw this to get an error here
      // but maybe this is leaking information to the users? But it also might be good
      // to allow that? Think about this harder maybe ask app sec about if this is an okay
      // design choice
      throw e;
    }
  }
</script>

{#snippet loadingSnip(val)}
  {val}
{/snippet}

{#snippet errorSnip(retry, error)}
  <div>{error}</div>

  <Button on:click={retry}>Retry Decoding</Button>
{/snippet}

{#await decodeValuePromise}
  {@render loading?.(keyedValue)}
{:then decoded}
  {@render children(decoded)}
{:catch err}
  {@render error?.(() => decodePayloads(value), err)}
{/await}
