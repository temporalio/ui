<script lang="ts">
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import ZoomSvg from '$lib/holocene/zoom-svg.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { RootNode } from '$lib/services/workflow-service';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  import PayloadDecoder from '../event/payload-decoder.svelte';
  import WorkflowStatus from '../workflow-status.svelte';

  import LiveChildWorkflowsTable from './live-child-workflows-table.svelte';
  import WorkflowFamilyNode from './workflow-family-node.svelte';

  $: ({ namespace } = $page.params);
  export let root: RootNode;

  let expandAll = false;

  // $: currentNode =
  //   root?.workflow?.runId === workflow.runId &&
  //   root?.workflow?.id === workflow.id;

  const onExpandAll = () => {
    expandAll = !expandAll;
  };

  let children: WorkflowExecution[] = [];
  let workflow: WorkflowExecution | undefined = undefined;

  const onNodeClick = (node: RootNode) => {
    if (
      node.workflow.id === workflow?.id &&
      node.workflow.runId === workflow?.runId
    ) {
      children = [];
      workflow = undefined;
    } else {
      children = node.children.map((child) => child.workflow);
      workflow = node.workflow;
    }
  };
</script>

<div
  class="h-[320px] w-full overflow-hidden rounded-xl border-2 border-subtle bg-primary"
>
  <ZoomSvg
    initialZoom={0.75}
    maxZoomOut={1.5}
    maxZoomIn={0.25}
    let:width
    let:height
    let:zoomLevel
    class="spin"
  >
    <svelte:fragment slot="controls">
      <Tooltip text="Expand All" left>
        <Button
          class="cursor-pointer"
          variant="secondary"
          size="sm"
          leadingIcon={expandAll ? 'eye-hide' : 'eye-show'}
          on:click={onExpandAll}
        />
      </Tooltip>
    </svelte:fragment>
    <WorkflowFamilyNode
      {root}
      {width}
      {height}
      {zoomLevel}
      {onNodeClick}
      {expandAll}
    />
  </ZoomSvg>
</div>
{#if workflow}
  <Table class="w-full">
    <caption class="sr-only" slot="caption"
      >{translate('common.workflows-plural', { count: 1 })}</caption
    >
    <TableHeaderRow slot="headers">
      <th class="smax-md:hidden">{translate('common.status')}</th>
      <th class="max-lg:hidden">{translate('common.type')}</th>
      <th>{translate('common.workflow-id')}</th>
      <th>{translate('common.run-id')}</th>
      <th>{translate('common.memo')}</th>
    </TableHeaderRow>
    <TableRow>
      <td class="max-md:hidden">
        <WorkflowStatus status={workflow.status} />
      </td>
      <td class="max-lg:hidden">
        {workflow.name}
      </td>
      <td class="hover:text-blue-700 hover:underline">
        <Link
          href={routeForEventHistory({
            namespace,
            workflow: workflow.id,
            run: workflow.runId,
          })}
        >
          {workflow.id}
        </Link>
      </td>
      <td class="hover:text-blue-700 hover:underline">
        <Link
          href={routeForEventHistory({
            namespace,
            workflow: workflow.id,
            run: workflow.runId,
          })}
        >
          {workflow.runId}
        </Link>
      </td>
      <td>
        <PayloadDecoder value={workflow.memo} key="fields" let:decodedValue>
          <CodeBlock content={decodedValue} />
        </PayloadDecoder>
      </td>
    </TableRow>
  </Table>
{/if}
{#if children.length}
  <LiveChildWorkflowsTable {children} />
{/if}
