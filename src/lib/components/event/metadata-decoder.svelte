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

  let decodedValue = fallback;

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

  const decodePayload = async (_value: Payload | undefined) => {
    if (!_value) {
      decodedValue = fallback;
      return;
    }

    try {
      const metadata = await decodeSingleReadablePayloadWithCodec(
        _value,
        settings,
      );

      if (typeof metadata === 'string') {
        decodedValue = metadata;
      }

      if (onDecode) {
        onDecode(decodedValue);
      }
    } catch (e) {
      console.error('Could not decode payloads');
    }
  };

  $: decodePayload(value);
</script>

<slot {decodedValue} />
