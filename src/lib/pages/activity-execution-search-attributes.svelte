<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activityExecution } from '$lib/utilities/activity-execution-poller.svelte';

  const searchAttributes = $derived($activityExecution.info.searchAttributes);
</script>

<div class="mt-4 flex flex-col gap-2">
  {#if searchAttributes}
    <PayloadDecoder
      value={{ searchAttributes: searchAttributes }}
      key="searchAttributes"
    >
      {#snippet children(decodedValue)}
        <CodeBlock
          content={decodedValue}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/snippet}
    </PayloadDecoder>
  {:else}
    <p>{translate('events.empty-search-attributes')}</p>
  {/if}
</div>
