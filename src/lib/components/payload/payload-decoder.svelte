<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import type { Memo, Payload as RawPayload } from '$lib/types';
  import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
  import {
    decodeEventAttributes,
    parsePayloadAttributes,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  interface Props {
    value:
      | PotentiallyDecodable
      | EventAttribute
      | WorkflowEvent
      | Memo
      | RawPayload
      | null
      | undefined;
    fieldName?: string;
    onDecode?: (decodedValue: string) => void;
    children: Snippet<[decodedValue: string]>;
  }

  let { value, fieldName = '', onDecode, children }: Props = $props();

  const getInitialValue = () => {
    if (!value) return stringifyWithBigInt(value);
    const keyedValue =
      fieldName && value?.[fieldName] ? value[fieldName] : value;
    return stringifyWithBigInt(keyedValue);
  };

  let decodedValue = $state(getInitialValue());

  onMount(async () => {
    if (!value) return;
    try {
      const convertedAttributes = await decodeEventAttributes(
        value as PotentiallyDecodable | EventAttribute | WorkflowEvent | Memo,
      );
      const decodedAttributes = parsePayloadAttributes(
        convertedAttributes,
      ) as object;
      const keyExists = fieldName && decodedAttributes?.[fieldName];
      let finalValue = keyExists
        ? decodedAttributes[fieldName]
        : decodedAttributes;
      if (Array.isArray(finalValue) && finalValue.length === 1) {
        finalValue = finalValue[0];
      }
      decodedValue = stringifyWithBigInt(finalValue);
      onDecode?.(decodedValue);
    } catch {
      console.error('Could not decode payloads');
    }
  });
</script>

{@render children(decodedValue)}
