<script lang="ts" module>
  export type PayloadDownloadFilenameData = {
    workflowId?: string;
    runId?: string;
    scheduleId?: string;
    type: 'input' | 'result' | undefined;
    eventId?: string | undefined;
  };
</script>

<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { downloadExternalPayloadWithCodec } from '$lib/services/data-encoder';
  import { codecEndpoint } from '$lib/stores/data-encoder-config';
  import type { Payload, Payloads } from '$lib/types';
  import {
    isExternallyStoredRawPayload,
    isParsedPayload,
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
    filenameData?: PayloadDownloadFilenameData;
  }

  let { value, maxHeight, testId, filenameData = undefined }: Props = $props();

  let downloadError: string | undefined = $state(undefined);
  let downloadLoading: boolean = $state(false);

  const fileName = $derived.by(() => {
    if (!filenameData) {
      return 'payload.json';
    }

    if (filenameData.scheduleId) {
      return `payload-schedule-${filenameData.scheduleId}.json`;
    }

    const base = `payload-wf-${filenameData.workflowId}-run-${filenameData.runId}`;
    if (filenameData.eventId) {
      return `${base}-event-${filenameData.eventId}-${filenameData.type}.json`;
    }

    return `${base}-${filenameData.type}.json`;
  });

  const downloadExternalPayload = async (payload: Payload) => {
    downloadError = undefined;
    downloadLoading = true;
    let data: Payloads | undefined = undefined;
    try {
      data = await downloadExternalPayloadWithCodec(payload);
      const parsed = parseRawPayloadToJSON(data.payloads[0]);
      const content = stringifyWithBigInt(parsed, undefined, 2);
      const a = document.createElement('a');
      const file = new Blob([content], { type: 'json/plain' });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    } catch (error) {
      if (isNetworkError(error) && error.statusCode === 404) {
        downloadError =
          "Unable to download payload file. Your codec server is connected, but it isn't configured to download from external storage.";
      } else {
        downloadError = 'Unable to download payload file.';
      }
    } finally {
      downloadLoading = false;
    }
  };
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
  {#snippet children(results)}
    <div class="space-y-2">
      {#each results as result (result)}
        {#if isExternallyStoredRawPayload(result?.decodedValue)}
          {@const size = formatBytes(
            result.decodedValue.externalPayloads?.[0].sizeBytes ?? 0,
          )}
          <CodeBlock
            content={stringifyWithBigInt(result.decodedValue.data)}
            {maxHeight}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            {testId}
            language="json"
          >
            {#snippet headerActions()}
              <Tooltip
                width={192}
                top
                hide={!!$codecEndpoint}
                text="Add a codec server with a /download endpoint to download this payload."
              >
                <Button
                  size="sm"
                  variant="ghost"
                  leadingIcon="download"
                  disabled={!$codecEndpoint}
                  loading={downloadLoading}
                  on:click={() => downloadExternalPayload(result.originalValue)}
                >
                  {size}
                </Button>
              </Tooltip>
            {/snippet}
          </CodeBlock>
          {#if downloadError}
            <div class="flex items-start gap-2 text-danger">
              <Icon width={16} height={16} name="exclamation-octagon" />
              <p class="leading-4">{downloadError}</p>
            </div>
          {/if}
          <p>
            Payload downloads require a codec server with a <span
              class="rounded-sm bg-code-block px-1 font-mono">/download</span
            >
            endpoint. <Link href="https://docs.temporal.io/codec-server" newTab
              >How to set up a codec server
            </Link>
            <Icon class="inline" name="external-link" />
          </p>
        {:else if isParsedPayload(result.decodedValue)}
          <CodeBlock
            content={stringifyWithBigInt(result.decodedValue.data)}
            {maxHeight}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            {testId}
            language="json"
          />
        {:else}
          <CodeBlock
            content={stringifyWithBigInt(result.decodedValue)}
            {maxHeight}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
            {testId}
            language="json"
          />
        {/if}
      {/each}
    </div>
  {/snippet}
  {#snippet error({ error, retry })}
    <CodeBlock
      content={stringifyWithBigInt(value)}
      {maxHeight}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      {testId}
      language="json"
    >
      {#snippet headerActions()}
        <IconButton
          icon="retry"
          on:click={retry}
          label={translate('common.retry')}
        />
      {/snippet}
    </CodeBlock>
    <div class="flex items-start gap-2 text-danger">
      <Icon width={16} height={16} name="exclamation-octagon" />
      <p class="leading-4">
        {#if isNetworkError(error)}
          {error.message} - {error.statusText}
        {:else}
          {stringifyWithBigInt(error)}
        {/if}
      </p>
    </div>
  {/snippet}
</PayloadDecoder>
