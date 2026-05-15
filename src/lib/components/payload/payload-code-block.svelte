<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    PayloadContainingObject,
    PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: PotentiallyDecodable | PayloadContainingObject;
    maxHeight?: number;
    testId?: string;
    language?: 'text' | 'json';
  }

  let { value, maxHeight, testId, language = 'json' }: Props = $props();
</script>

<PayloadDecoder {value}>
  {#snippet loading()}
    <CodeBlock
      content={stringifyWithBigInt(value)}
      {maxHeight}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      {testId}
      language="json"
    />
  {/snippet}
  {#snippet children(decodedValue)}
    <div class="space-y-2">
      {#each decodedValue as data, index (index)}
        <CodeBlock
          content={data}
          {maxHeight}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          {testId}
          {language}
        />
      {/each}
    </div>
  {/snippet}
</PayloadDecoder>
