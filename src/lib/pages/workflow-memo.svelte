<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { workflow } = $derived($workflowRun);
</script>

<div class="mt-4 flex flex-col gap-2">
  <h3>{translate('common.memo')}</h3>
  {#if workflow?.memo}
    <PayloadCodeBlock
      value={{ memo: workflow.memo }}
      fieldName="memo"
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
    />
  {:else}
    <p>{translate('events.empty-memo-attributes')}</p>
  {/if}
</div>
