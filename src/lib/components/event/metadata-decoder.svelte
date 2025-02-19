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
  export let prefix: string = '';
  export let onDecode: (decodedValue: string) => void | undefined = undefined;

  const maxLength = 120;

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

  const setPrefix = (metadata: string) => {
    if (prefix) {
      metadata = `${prefix} • ${metadata}`;
      if (metadata.length < maxLength) return metadata;
      return metadata.slice(0, maxLength) + '...';
    }
    return metadata;
  };

  $: decodePayload = async (_value: Payload | undefined) => {
    if (!_value) return fallback;
    if (decodedValue) return decodedValue;

    const metadata = await decodeSingleReadablePayloadWithCodec(
      _value,
      settings,
    );

    if (typeof metadata === 'string') {
      decodedValue = setPrefix(metadata);
      if (onDecode) {
        onDecode(decodedValue);
      }
      return decodedValue;
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
