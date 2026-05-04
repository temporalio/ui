<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    downloadExternalPayloadWithCodec,
    NO_CODEC_SERVER_CONFIGURED_ERROR,
  } from '$lib/services/data-encoder';
  import { toaster } from '$lib/stores/toaster';
  import type { Payload, Payloads } from '$lib/types';
  import {
    isExternallyStoredRawPayload,
    isRawPayload,
    parseRawPayloadToJSON,
    type PayloadContainingObject,
  } from '$lib/utilities/decode-payload';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: Payload | Payloads | PayloadContainingObject;
    maxHeight?: number;
    testId?: string;
  }

  let { value, maxHeight, testId }: Props = $props();

  let downloadError: string | undefined = $state(undefined);

  const downloadExternalPayload = async (payload: Payload) => {
    let data: Payloads | undefined = undefined;
    try {
      data = await downloadExternalPayloadWithCodec(payload);
      const parsed = parseRawPayloadToJSON(data.payloads[0], false);
      const content = stringifyWithBigInt(parsed);
      const a = document.createElement('a');
      const file = new Blob([content], { type: 'json/plain' });
      a.href = URL.createObjectURL(file);
      a.download = 'payload.json';
      a.click();
    } catch (error) {
      console.error(error);
      if (isNetworkError(error) && error.statusCode === 404) {
        downloadError = 'Unable to download payload file.';
        toaster.push({
          variant: 'error',
          duration: 5000,
          message:
            'Unable to download file due to codec server not having a /download endpoint configured. Update codec server and try again.',
        });
      } else if (error === NO_CODEC_SERVER_CONFIGURED_ERROR) {
        downloadError =
          'Unable to download payload file. No codec server is configured.';
        toaster.push({
          variant: 'error',
          duration: 5000,
          message:
            'Unable to download file due to no codec server being configured. Add a codec server with a /download endpoint and try again.',
        });
      }
    }
  };
</script>

<PayloadDecoder {value}>
  {#snippet children(results)}
    <div class="space-y-2">
      {#each results as result (result.decodedValue)}
        {#if isExternallyStoredRawPayload(result.decodedValue)}
          <CodeBlock
            content={stringifyWithBigInt(result.decodedValue.data)}
            {maxHeight}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            {testId}
            language="json"
          >
            {#snippet headerActions()}
              <Button
                size="sm"
                variant="ghost"
                leadingIcon="download"
                on:click={() => downloadExternalPayload(result.originalValue)}
              >
                {formatBytes(
                  result.decodedValue.externalPayloads?.[0].sizeBytes,
                )}
              </Button>
            {/snippet}
          </CodeBlock>
          {#if downloadError}
            <div class="flex items-center gap-1 text-danger">
              <Icon name="exclamation-octagon" />
              <p>{downloadError}</p>
            </div>
          {/if}
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
