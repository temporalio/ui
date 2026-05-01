<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    PayloadContainingObject,
    PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: PotentiallyDecodable | PayloadContainingObject;
    maxHeight?: number;
    testId?: string;
  }

  let { value, maxHeight, testId }: Props = $props();
</script>

<PayloadDecoder {value}>
  {#snippet children(decodedValue)}
    <div class="space-y-2">
      {#each decodedValue as data (data)}
        <CodeBlock
          content={data}
          {maxHeight}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          {testId}
          language="json"
        />
      {/each}
    </div>
  {/snippet}
</PayloadDecoder>
