<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { format } from '$lib/utilities/format-camel-case';
  import {
    getCodeBlockValue,
    getStackTrace,
  } from '$lib/utilities/get-single-attribute-for-event';

  import PayloadDecoder from './payload-decoder.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { payloadFields }: { payloadFields: [string, any][] } = $props();
</script>

{#each payloadFields as [key, value] (key)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div>
    <p class="mb-1 min-w-56 text-sm text-secondary/80">
      {format(key)}
    </p>
    {#if value?.payloads}
      <PayloadDecoder {value} key="payloads">
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else if key === 'searchAttributes'}
      <PayloadDecoder
        key="searchAttributes"
        value={{ searchAttributes: codeBlockValue }}
      >
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else}
      <PayloadDecoder value={codeBlockValue}>
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {/if}
  </div>
  {#if stackTrace}
    <div>
      <p class="mb-1 min-w-56 text-sm text-secondary/80">
        {translate('workflows.call-stack-tab')}
      </p>
      <CodeBlock
        content={stackTrace}
        language="text"
        maxHeight={384}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/each}
