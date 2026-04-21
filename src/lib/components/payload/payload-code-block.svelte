<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EditorLanguage } from '$lib/vendor/codemirror/custom-extensions';

  import {
    type DecodableValue,
    decodePayloadValue,
    getInitialPayloadValue,
  } from './decode-payload-value';

  interface Props {
    value: DecodableValue;
    fieldName?: string;
    maxHeight?: number;
    testId?: string;
    language?: EditorLanguage;
    onDecode?: (decodedValue: string) => void;
  }

  let { value, fieldName = '', maxHeight, testId, onDecode }: Props = $props();

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
  copyIconTitle={translate('common.copy-icon-title')}
  copySuccessIconTitle={translate('common.copy-success-icon-title')}
  {testId}
  language="json"
/>
