<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { workflow } = $derived($workflowRun);
</script>

<div class="mt-4 flex flex-col gap-2">
  <h3>{translate('common.memo')}</h3>
  {#if workflow?.memo}
    <PayloadDecoder value={{ memo: workflow.memo }} key="memo">
      {#snippet children(decodedValue)}
        <CodeBlock
          content={decodedValue}
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      {/snippet}
    </PayloadDecoder>
  {:else}
    <p>{translate('events.empty-memo-attributes')}</p>
  {/if}
</div>
