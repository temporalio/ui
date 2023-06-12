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

<PageTitle title={`Archival | ${namespaceName}`} url={$page.url.href} />
{#if archivalEnabled && visibilityArchivalEnabled}
  <h1 class="text-2xl" data-testid="archived-enabled-title">
    Archived Workflows
  </h1>
  {#if !archivalQueryingNotSupported}<WorkflowFilters />{/if}
  {#if workflows?.length}
    <Pagination
      items={workflows}
      let:visibleItems
      aria-label="archived workflows"
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
      title={'No Workflows Found'}
      content={'If you have filters applied, try adjusting them.'}
    />
  {/if}
{:else if archivalEnabled}
  <h1 class="text-2xl" data-testid="visibility-disabled-title">
    This namespace is currently enabled for archival but visibility is not
    enabled.
  </h1>
  <p>
    To enable <a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/clusters#archival"
      target="_blank"
      rel="noreferrer">archival visibility</a
    >:
  </p>
  <CodeBlock
    content={`temporal operator namespace update --visibility-archival-state enabled ${namespaceName}`}
    language="text"
    inline
  />
{:else}
  <h1 class="text-2xl" data-testid="archived-disabled-title">
    This namespace is currently not enabled for archival.
  </h1>
  <p>Run this command to enable archival visibility for event histories:</p>
  <CodeBlock
    content={`temporal operator namespace update --history-archival-state enabled ${namespaceName}`}
    language="text"
    inline
  />
  {#if !visibilityArchivalEnabled}
    <p>
      To enable <a
        class="text-blue-700 underline"
        href="https://docs.temporal.io/clusters#archival"
        target="_blank"
        rel="noreferrer">archival visibility</a
      >:
    </p>
    <CodeBlock
      content={`temporal operator namespace update --visibility-archival-state enabled ${namespaceName}`}
      language="text"
      inline
    />
  {/if}
{/if}
