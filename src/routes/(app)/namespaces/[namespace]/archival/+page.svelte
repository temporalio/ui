<script lang="ts">
  import type { PageData } from './$types';
  import { timeFormat } from '$lib/stores/time-format';
  import { page } from '$app/stores';

  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';

  export let data: PageData & { archivalQueryingNotSupported: boolean };

  $: ({
    namespace: {
      namespaceInfo: { name: namespaceName },
    },
    workflows,
    archivalEnabled,
    visibilityArchivalEnabled,
    archivalQueryingNotSupported,
  } = data);
</script>

<PageTitle
  title={`${translate('workflows', 'archival')} | ${namespaceName}`}
  url={$page.url.href}
/>
{#if archivalEnabled && visibilityArchivalEnabled}
  <h1 class="text-2xl" data-testid="archived-enabled-title">
    {translate('workflows', 'archived-workflows')}
  </h1>
  {#if !archivalQueryingNotSupported}<WorkflowFilters />{/if}
  {#if workflows?.length}
    <Pagination
      items={workflows}
      let:visibleItems
      aria-label={translate('workflows', 'archived-workflows')}
      pageSizeSelectLabel={translate('per-page')}
    >
      <WorkflowsSummaryTable>
        {#each visibleItems as event}
          <WorkflowsSummaryRow
            workflow={event}
            namespace={namespaceName}
            timeFormat={$timeFormat}
          />
        {/each}
      </WorkflowsSummaryTable>
    </Pagination>
  {:else}
    <EmptyState
      title={translate('workflows', 'empty-state-title')}
      content={translate('workflows', 'empty-state-description')}
    />
  {/if}
{:else if archivalEnabled}
  <h1 class="text-2xl" data-testid="visibility-disabled-title">
    {translate('workflows', 'visibility-disabled-archival')}
  </h1>
  <p>
    {translate('workflows', 'archival-link-preface')}<a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/clusters#archival"
      target="_blank"
      rel="noreferrer">{translate('workflows', 'archival-link')}</a
    >:
  </p>
  <CodeBlock
    content={`temporal operator namespace update --visibility-archival-state enabled ${namespaceName}`}
    language="text"
    inline
  />
{:else}
  <h1 class="text-2xl" data-testid="archived-disabled-title">
    {translate('workflows', 'archival-disabled-title')}
  </h1>
  <p>{translate('workflows', 'archival-disabled-details')}:</p>
  <CodeBlock
    content={`temporal operator namespace update --history-archival-state enabled ${namespaceName}`}
    language="text"
    inline
  />
  {#if !visibilityArchivalEnabled}
    <p>
      {translate('workflows', 'archival-link-preface')}<a
        class="text-blue-700 underline"
        href="https://docs.temporal.io/clusters#archival"
        target="_blank"
        rel="noreferrer">{translate('workflows', 'archival-link')}</a
      >:
    </p>
    <CodeBlock
      content={`temporal operator namespace update --visibility-archival-state enabled ${namespaceName}`}
      language="text"
      inline
    />
  {/if}
{/if}
