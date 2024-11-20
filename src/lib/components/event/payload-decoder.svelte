<script lang="ts">
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
  export let onDecode: (decodedValue: string) => void | undefined = undefined;

  let keyedValue = key && value?.[key] ? value[key] : value;
  let decodedValue = stringifyWithBigInt(keyedValue);

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

  const decodePayloads = async (
    _value: PotentiallyDecodable | EventAttribute | WorkflowEvent,
  ) => {
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
      if (keyExists) {
        decodedValue = stringifyWithBigInt(keyExists);
      } else {
        decodedValue = stringifyWithBigInt(decodedAttributes);
      }

      if (onDecode) {
        onDecode(decodedValue);
      }
    } catch (e) {
      console.error('Could not decode payloads');
    }
  };

  $: decodePayloads(value);
</script>

<slot {decodedValue} />
