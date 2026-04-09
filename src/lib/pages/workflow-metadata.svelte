<script lang="ts">
  import Payload from '$lib/components/payload.svelte';
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
      <Payload
        value={{ searchAttributes: workflow.searchAttributes }}
        key="searchAttributes"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}

  {#if workflow?.memo}
    <div class="mt-4 flex flex-col gap-2">
      <h3>{translate('common.memo')}</h3>
      <Payload
        value={{ memo: workflow.memo }}
        key="memo"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
</div>
