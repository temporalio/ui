<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { downloadExternalPayloadWithCodec } from '$lib/services/data-encoder';
  import {
    isExternallyStoredRawPayload,
    type ParsedPayload,
    type PayloadContainingObject,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: PotentiallyDecodable | PayloadContainingObject;
    maxHeight?: number;
    testId?: string;
  }

  let { value, maxHeight, testId }: Props = $props();

  const downloadExternalPayload = async (payload: ParsedPayload) => {
    const stuff = await downloadExternalPayloadWithCodec(payload);
  };
</script>

<PayloadDecoder {value}>
  {#snippet children(decodedPayloads)}
    <div class="space-y-2">
      {#each decodedPayloads as payload (payload.data)}
        <CodeBlock
          content={stringifyWithBigInt(payload.data)}
          {maxHeight}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
          {testId}
          language="json"
        >
          {#snippet headerActions()}
            {#if isExternallyStoredRawPayload(payload)}
              <Button
                size="sm"
                variant="ghost"
                leadingIcon="download"
                on:click={() => downloadExternalPayload(payload)}
              >
                {formatBytes(payload.externalPayloads?.[0].sizeBytes)}
              </Button>
            {/if}
          {/snippet}
        </CodeBlock>
        {#if isExternallyStoredRawPayload(payload)}
          <p>
            Payload downloads require a codec server with a <span
              class="rounded-sm bg-code-block px-1 font-mono">/download</span
            > endpoint.
          </p>
        {/if}
      {/each}
    </div>
  {/snippet}
</PayloadDecoder>
