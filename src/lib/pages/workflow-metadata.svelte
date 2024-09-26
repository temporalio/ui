<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: ({ workflow } = $workflowRun);
</script>

<div class="flex flex-col gap-4">
  {#if workflow?.searchAttributes}
    <div class="mt-4 flex flex-col gap-2">
      <h3>
        {translate('events.attribute-group.search-attributes')}
      </h3>
      <div class="h-0.5 rounded-full bg-inverse" />
      <PayloadDecoder
        value={{ searchAttributes: workflow.searchAttributes }}
        key="searchAttributes"
        let:decodedValue
      >
        <CodeBlock
          content={decodedValue}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </PayloadDecoder>
    </div>
  {/if}

  {#if workflow?.memo}
    <div class="mt-4 flex flex-col gap-2">
      <h3>{translate('common.memo')}</h3>
      <div class="h-0.5 rounded-full bg-inverse" />
      <PayloadDecoder
        value={{ memo: workflow.memo }}
        key="memo"
        let:decodedValue
      >
        <CodeBlock
          content={decodedValue}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </PayloadDecoder>
    </div>
  {/if}
</div>
