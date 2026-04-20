<script lang="ts">
  import { onMount } from 'svelte';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { Memo, Payload as RawPayload } from '$lib/types';
  import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
  import {
    decodeEventAttributes,
    parsePayloadAttributes,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import type { EditorLanguage } from '$lib/vendor/codemirror/custom-extensions';

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
    maxHeight?: number;
    copyIconTitle?: string;
    copySuccessIconTitle?: string;
    testId?: string;
    language?: EditorLanguage;
    onDecode?: (decodedValue: string) => void;
  }

  let {
    value,
    fieldName = '',
    maxHeight,
    copyIconTitle = '',
    copySuccessIconTitle = '',
    testId,
    language = 'json',
    onDecode,
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
      onDecode?.(decodedValue);
    } catch {
      console.error('Could not decode payloads');
    }
  });
</script>

<CodeBlock
  content={decodedValue}
  {maxHeight}
  {copyIconTitle}
  {copySuccessIconTitle}
  {testId}
  {language}
/>
