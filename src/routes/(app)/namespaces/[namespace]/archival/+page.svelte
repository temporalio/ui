<script lang="ts">
  import type { PageData } from './$types';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import PageTitle from '$lib/components/page-title.svelte';
  import { page } from '$app/stores';

  export let data: PageData;

  $: ({
    namespace: {
      namespaceInfo: { name: namespaceName },
    },
    workflows,
    archivalEnabled,
    visibilityArchivalEnabled,
  } = data);
</script>

<PageTitle title={`Archival | ${namespaceName}`} url={$page.url.href} />
{#if archivalEnabled && visibilityArchivalEnabled}
  <h1 class="text-2xl" data-cy="archived-enabled-title">Archived Workflows</h1>
  <WorkflowFilters />
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
  <h1 class="text-2xl" data-cy="visibility-disabled-title">
    This Namespace is currently enabled for archival but visibility is not
    enabled.
  </h1>
  <p>To enable Visibility Archival:</p>
  <CodeBlock
    content={`tctl --namespace ${namespaceName} namespace update -vas enabled`}
    language="text"
    inline
  />
  <p>
    For more details, please check out <a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/clusters#archival"
      target="_blank"
      rel="noreferrer">Archival documentation</a
    >.
  </p>
{:else}
  <h1 class="text-2xl" data-cy="archived-disabled-title">
    This Namespace is currently not enabled for archival.
  </h1>
  <p>Run this command to enable Archival for Event Histories:</p>
  <CodeBlock
    content={`tctl --namespace ${namespaceName} namespace update --has enabled`}
    language="text"
    inline
  />
  {#if !visibilityArchivalEnabled}
    <p>To enable Visibility Archival:</p>
    <CodeBlock
      content={`tctl --namespace ${namespaceName} namespace update -vas enabled`}
      language="text"
      inline
    />
  {/if}
  <p>
    For more details, please check out <a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/clusters#archival"
      target="_blank"
      rel="noreferrer">Archival documentation</a
    >.
  </p>
{/if}
