<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
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
      <PayloadCodeBlock
        value={{ searchAttributes: workflow.searchAttributes }}
        fieldName="searchAttributes"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}

  {#if workflow?.memo}
    <div class="mt-4 flex flex-col gap-2">
      <h3>{translate('common.memo')}</h3>
      <PayloadCodeBlock
        value={{ memo: workflow.memo }}
        fieldName="memo"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
</div>
