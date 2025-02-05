<script lang="ts">
  import { page } from '$app/stores';

  import type { Payload } from '$lib/types';
  import { decodeSingleReadablePayloadWithCodec } from '$lib/utilities/decode-payload';
  import {
    getCodecEndpoint,
    getCodecIncludeCredentials,
    getCodecPassAccessToken,
  } from '$lib/utilities/get-codec';

  export let value: Payload | undefined = undefined;
  export let fallback: string = '';
  export let onDecode: (decodedValue: string) => void | undefined = undefined;

  let decodedValue = '';

  $: endpoint = getCodecEndpoint($page.data.settings);
  $: passAccessToken = getCodecPassAccessToken($page.data.settings);
  $: includeCredentials = getCodecIncludeCredentials($page.data.settings);
  $: settings = {
    ...$page.data.settings,
    codec: {
      ...$page.data.settings?.codec,
      endpoint,
      passAccessToken,
      includeCredentials,
    },
  };

  $: decodePayload = async (_value: Payload | undefined) => {
    if (!_value) return fallback;
    if (decodedValue) return decodedValue;

    const metadata = await decodeSingleReadablePayloadWithCodec(
      _value,
      settings,
    );

    if (typeof metadata === 'string') {
      if (onDecode) {
        onDecode(metadata);
      }
      decodedValue = metadata;
      return metadata;
    }

    decodedValue = fallback;
    return fallback;
  };
</script>

{#await decodePayload(value) then metadata}
  <slot decodedValue={metadata} />
{:catch}
  <slot decodedValue={fallback} />
{/await}
