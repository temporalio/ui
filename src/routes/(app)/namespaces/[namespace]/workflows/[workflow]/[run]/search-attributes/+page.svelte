<script lang="ts">
  import { page } from '$app/state';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPaddedLayout from '$lib/layouts/workflow-padded-layout.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { workflow } = $derived($workflowRun);
</script>

<PageTitle
  title={`${translate('workflows.search-attributes-tab')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowPaddedLayout>
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
</WorkflowPaddedLayout>
