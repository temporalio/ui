<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import { authUser } from '$lib/stores/auth-user';
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

  export let value: PotentiallyDecodable | EventAttribute | WorkflowEvent;
  export let key = '';

  $: keyedValue = key && value?.[key] ? value[key] : value;
  $: decodedValue = stringifyWithBigInt(keyedValue);
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
    try {
      const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
        value,
        $page.params.namespace,
        settings,
        $authUser.accessToken,
      );
      const decodedAttributes = decodePayloadAttributes(
        convertedAttributes,
      ) as object;
      const keyExists = key && decodedAttributes?.[key];
      if (keyExists) {
        decodedValue = stringifyWithBigInt(keyExists);
      } else {
        decodedValue = stringifyWithBigInt(decodedAttributes);
      }
    } catch (e) {
      console.error('Could not decode payloads');
    }
  };

  onMount(() => {
    decodePayloads();
  });
</script>

<slot {decodedValue} />
