<script lang="ts">
  import { page } from '$app/stores';

  import { authUser } from '$lib/stores/auth-user';
  import type { Payloads } from '$lib/types';
  import {
    cloneAllPotentialPayloadsWithCodec,
    decodePayloadAttributes,
  } from '$lib/utilities/decode-payload';
  import {
    getCodecEndpoint,
    getCodecIncludeCredentials,
    getCodecPassAccessToken,
  } from '$lib/utilities/get-codec';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  export let value: Payloads;

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

  const decodePayloads = async () => {
    const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
      value,
      $page.params.namespace,
      settings,
      $authUser.accessToken,
    );
    const decodedAttributes = decodePayloadAttributes(
      convertedAttributes,
    ) as object;
    decodedValue = stringifyWithBigInt(decodedAttributes);
  };

  $: value, decodePayloads();

  let decodedValue = '';
</script>

<slot {decodedValue} />
