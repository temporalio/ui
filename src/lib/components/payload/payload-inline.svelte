<script lang="ts">
  import { onMount } from 'svelte';

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
    truncateAt?: number;
    class?: string;
  }

  let {
    value,
    fieldName = '',
    truncateAt = 60,
    class: className = '',
  }: Props = $props();

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
    } catch {
      console.error('Could not decode payloads');
    }
  });
</script>

<div
  class="overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs text-primary {className}"
>
  <code>
    <pre class="truncate">{decodedValue.slice(0, truncateAt)}</pre>
  </code>
</div>
