<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { workflow } = $derived($workflowRun);
</script>

<div class="mt-4 flex flex-col gap-2">
  <h3>
    {translate('events.attribute-group.search-attributes')}
  </h3>
  {#if workflow?.searchAttributes}
    <PayloadDecoder
      value={{ searchAttributes: workflow.searchAttributes }}
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
