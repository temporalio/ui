<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';

  export const load: Load = async function ({ params, url, stuff }) {
    const { searchParams } = url;

    if (!searchParams.has('time-range'))
      searchParams.set('time-range', '1 day');

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

    const namespaces: DescribeNamespaceResponse[] = stuff.namespaces;

    const currentNamespaceConfig = namespaces.find(
      (namespaceConfig) => namespaceConfig.namespaceInfo.name === namespace,
    );

    // These are incorrectly typed as enums and need to be coerced to strings
    const archivalEnabled =
      (currentNamespaceConfig?.config
        ?.historyArchivalState as unknown as string) === 'Enabled';

    const visibilityArchivalEnabled =
      (currentNamespaceConfig?.config
        ?.visibilityArchivalState as unknown as string) === 'Enabled';

    const initialData: CombinedWorkflowExecutionsResponse | null =
      archivalEnabled && visibilityArchivalEnabled
        ? await fetchAllArchivedWorkflows(namespace, parameters, fetch)
        : null;

    return {
      props: {
        workflows: initialData ? initialData.workflows : [],
        namespace,
        archivalEnabled,
        visibilityArchivalEnabled,
      },
    };
  };
</script>

<script lang="ts">
  import type { DescribeNamespaceResponse } from '$types';
  import { fetchAllArchivedWorkflows } from '$lib/services/workflow-service';

  import WorkflowsSummaryTable from '../workflows/_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '../workflows/_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import { timeFormat } from '$lib/stores/time-format';

  export let namespace: string;
  export let workflows: WorkflowExecution[];
  export let archivalEnabled: boolean = false;
  export let visibilityArchivalEnabled: boolean = false;
</script>

{#if archivalEnabled && visibilityArchivalEnabled}
  <h2 class="text-2xl" data-cy="archived-enabled-title">Archived Workflows</h2>
  <WorkflowFilters />
  {#if workflows?.length}
    <Pagination items={workflows} let:visibleItems>
      <WorkflowsSummaryTable>
        {#each visibleItems as event}
          <WorkflowsSummaryRow
            workflow={event}
            {namespace}
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
  <h2 class="text-2xl" data-cy="visibility-disabled-title">
    This namespace is currently enabled for archival but visibility is not
    enabled.
  </h2>
  <p>To enable Visibility Archival:</p>
  <CodeBlock
    content={`tctl --namespace ${namespace} namespace update -vas enabled`}
    language="text"
    inline
  />
  <p>
    For more details, please check out <a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/server/archive-data/"
      target="_blank">Archival documentation</a
    >.
  </p>
{:else}
  <h2 class="text-2xl" data-cy="archived-disabled-title">
    This namespace is currently not enabled for archival.
  </h2>
  <p>Run this command to enable Archival for Event Histories:</p>
  <CodeBlock
    content={`tctl --namespace ${namespace} namespace update --has enabled`}
    language="text"
    inline
  />
  {#if !visibilityArchivalEnabled}
    <p>To enable Visibility Archival:</p>
    <CodeBlock
      content={`tctl --namespace ${namespace} namespace update -vas enabled`}
      language="text"
      inline
    />
  {/if}
  <p>
    For more details, please check out <a
      class="text-blue-700 underline"
      href="https://docs.temporal.io/server/archive-data/"
      target="_blank">Archival documentation</a
    >.
  </p>
{/if}
