<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import type { Memo } from '$lib/types';
  import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
  import {
    decodeEventAttributes,
    parsePayloadAttributes,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  interface Props {
    value: PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo;
    key?: string;
    onDecode?: (decodedValue: string) => void;
    children: Snippet<[decodedValue: string]>;
  }

  let { children, value, key = '', onDecode }: Props = $props();

  let keyedValue = key && value?.[key] ? value[key] : value;
  let decodedValue = $state(stringifyWithBigInt(keyedValue));

  onMount(() => {
    decodePayloads(value);
  });

  const decodePayloads = async (
    _value: PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
  ) => {
    try {
      const convertedAttributes = await decodeEventAttributes(_value);
      const decodedAttributes = parsePayloadAttributes(
        convertedAttributes,
      ) as object;
      const keyExists = key && decodedAttributes?.[key];
      let finalValue = keyExists ? decodedAttributes[key] : decodedAttributes;
      if (Array.isArray(finalValue) && finalValue.length === 1) {
        finalValue = finalValue[0];
      }
      decodedValue = stringifyWithBigInt(finalValue);
      if (onDecode) {
        onDecode(decodedValue);
      }
    } catch {
      console.error('Could not decode payloads');
    }
  };
</script>

{@render children(decodedValue)}
