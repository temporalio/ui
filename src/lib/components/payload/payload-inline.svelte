<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    isExternallyStoredRawPayload,
    isParsedPayload,
    type PotentiallyDecodable,
  } from '$lib/utilities/decode-payload';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from './payload-decoder.svelte';

  interface Props {
    value: PotentiallyDecodable;
    truncateAt?: number;
    class?: string;
  }

  let { value, truncateAt = 60, class: className = '' }: Props = $props();
</script>

{#snippet codeBlock(value: string)}
  <div
    class="overflow-hidden border border-subtle bg-code-block px-1 py-0.5 font-mono text-xs text-primary {className}"
  >
    <code>
      <pre class="truncate">{value.slice(0, truncateAt)}</pre>
    </code>
  </div>
{/snippet}

<PayloadDecoder {value}>
  {#snippet children(results)}
    {#if isExternallyStoredRawPayload(results[0]?.decodedValue)}
      {@const size = formatBytes(
        results[0].decodedValue.externalPayloads?.[0].sizeBytes ?? 0,
      )}
      <div class="flex flex-row items-center gap-2">
        <Icon name="storage" />
        {@render codeBlock(`${size} payload stored externally`)}
      </div>
    {:else if isParsedPayload(results[0]?.decodedValue)}
      {@const stringifiedData = stringifyWithBigInt(
        results[0].decodedValue.data,
      )}
      {@render codeBlock(stringifiedData)}
    {:else}
      {@const stringifiedData = stringifyWithBigInt(results[0].decodedValue)}
      {@render codeBlock(stringifiedData)}
    {/if}
  {/snippet}
  {#snippet error({ error, retry })}
    {@render codeBlock(
      isNetworkError(error)
        ? (error.message ?? '')
        : (stringifyWithBigInt(error) ?? ''),
    )}
    <IconButton
      class="h-8 w-8"
      icon="retry"
      on:click={retry}
      label={translate('common.retry')}
    />
  {/snippet}
</PayloadDecoder>
