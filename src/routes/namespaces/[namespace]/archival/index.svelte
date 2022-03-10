<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params, url, stuff }) {
    const { searchParams } = url;

    if (!searchParams.has('time-range'))
      searchParams.set('time-range', '24 hours');

    const namespace = params.namespace;
    const workflowId = searchParams.get('workflow-id');
    const workflowType = searchParams.get('workflow-type');
    const timeRange = searchParams.get('time-range');
    const executionStatus = searchParams.get('status') as WorkflowStatus;

    const parameters: ArchiveFilterParameters = {
      workflowId,
      workflowType,
      closeTime: timeRange,
      executionStatus,
    };

    const NameSpaceStore: DescribeNamespaceResponse[] = stuff.namespaces;

    const currentNamespaceConfig = NameSpaceStore.find(
      (namespaceConfig) => namespaceConfig.namespaceInfo.name === namespace,
    );

    // These are incorrectly typed as enums and need to be coerced to strings
    const archivalEnabled =
      (currentNamespaceConfig?.config
        ?.historyArchivalState as unknown as string) === 'Enabled';

    const visibilityArchivalEnabled =
      (currentNamespaceConfig?.config
        ?.visibilityArchivalState as unknown as string) === 'Enabled';

    const initialData = archivalEnabled
      ? await fetchAllArchivedWorkflows(namespace, parameters, fetch)
      : Promise.resolve(null);

    return {
      props: {
        initialData,
        namespace,
        parameters,
        archivalEnabled,
        visibilityArchivalEnabled,
      },
    };
  };
</script>

<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';

  import type { DescribeNamespaceResponse } from '$types';
  import {
    CombinedWorkflowExecutionsResponse,
    fetchAllArchivedWorkflows,
  } from '$lib/services/workflow-service';

  import WorkflowsSummaryTable from '../workflows/_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '../workflows/_workflows-summary-row.svelte';
  import WorkflowFilters from '../workflows/_workflow-filters.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import WorkflowsLoadingState from '../workflows/_workflows-loading.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let namespace: string;
  export let initialData: ReturnType<typeof fetchAllArchivedWorkflows>;
  export let parameters: ArchiveFilterParameters;
  export let archivalEnabled: boolean = false;
  export let visibilityArchivalEnabled: boolean = false;

  let timeFormat: TimeFormat = 'UTC';

  let data: Promise<CombinedWorkflowExecutionsResponse | null> = initialData;

  $: {
    if (archivalEnabled) {
      data = fetchAllArchivedWorkflows(namespace, parameters);
    }
  }
</script>

{#if archivalEnabled}
  <h2 class="text-2xl">Archived Workflows</h2>
  <WorkflowFilters bind:timeFormat />
  {#await data}
    <WorkflowsLoadingState />
  {:then { workflows }}
    {#if workflows.length}
      <WorkflowsSummaryTable>
        <VirtualList items={workflows} let:item>
          <WorkflowsSummaryRow workflow={item} {timeFormat} />
        </VirtualList>
      </WorkflowsSummaryTable>
    {:else}
      <EmptyState
        title={'No Workflows Found'}
        content={'If you have filters applied, try adjusting them.'}
      />
    {/if}
  {/await}
{:else}
  <h2 class="text-2xl">
    This namespace is currently not enabled for archival.
  </h2>
  <p>Run this command to enable Archival for Event Histories:</p>
  <CodeBlock
    content={`tctl --namespace default namespace update --has enabled`}
    language="text"
  />
  {#if !visibilityArchivalEnabled}
    <p>To enable Visibility Archival:</p>
    <CodeBlock
      content="tctl --namespace default namespace update -vas enabled"
      language="text"
    />
  {/if}
  <p>
    For more details please check out <a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/docs/server/archive-data/">Archival Docs</a
    >
  </p>
{/if}
