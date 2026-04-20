<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    type DecodableValue,
    decodePayloadValue,
    getInitialPayloadValue,
  } from '$lib/utilities/decode-payload-value';
  import type { EditorLanguage } from '$lib/vendor/codemirror/custom-extensions';

  interface Props {
    value: DecodableValue;
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

  let decodedValue = $state(getInitialPayloadValue(value, fieldName));

  $effect(() => {
    if (!value) return;
    decodePayloadValue(value, fieldName)
      .then((result) => {
        decodedValue = result;
        onDecode?.(result);
      })
      .catch(() => {
        console.error('Could not decode payloads');
      });
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
