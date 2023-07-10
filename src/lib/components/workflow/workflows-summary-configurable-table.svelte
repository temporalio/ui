<script lang="ts">
  import { workflowTableColumns } from '$lib/stores/workflow-table-columns';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TableWrapper from './workflows-summary-configurable-table/table-wrapper.svelte';
  import Table from './workflows-summary-configurable-table/table.svelte';
  import TableHeaderCell from './workflows-summary-configurable-table/table-header-cell.svelte';
  import TableRow from './workflows-summary-configurable-table/table-row.svelte';
  import TableHeaderRow from './workflows-summary-configurable-table/table-header-row.svelte';
  import TableBodyCell from './workflows-summary-configurable-table/table-body-cell.svelte';
  import WorkflowColumnsOrderableList from './workflows-summary-configurable-table/orderable-list.svelte';
  import { translate } from '$lib/i18n/translate';
  import { page } from '$app/stores';

  export let workflows: WorkflowExecution[];

  let customizationDrawerOpen: boolean = false;

  $: ({ namespace } = $page.params);
  $: columns = $workflowTableColumns?.[namespace] ?? [];
  $: empty = workflows.length === 0;
  $: pinnedColumns = columns.filter((column) => column.pinned);
  $: otherColumns = columns.filter((column) => !column.pinned);
  $: totalColumnCount = pinnedColumns.length + otherColumns.length;

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const closeCustomizationDrawer = () => {
    customizationDrawerOpen = false;
  };
</script>

<div class="workflows-summary-configurable-table">
  <TableWrapper noPinnedColumns={pinnedColumns.length === 0}>
    <Table pinned {empty} {totalColumnCount} columns={pinnedColumns}>
      <TableHeaderRow pinned {workflows} {pinnedColumns} {empty} slot="headers">
        {#each pinnedColumns as column}
          <TableHeaderCell {column} />
        {/each}
      </TableHeaderRow>
      {#each workflows as workflow}
        <TableRow pinned {workflow}>
          {#each pinnedColumns as column}
            <TableBodyCell {column} {workflow} />
          {/each}
        </TableRow>
      {/each}
    </Table>
    <Table
      {empty}
      {totalColumnCount}
      columns={otherColumns}
      slot="unpinned-columns"
    >
      <TableHeaderRow
        onClickConfigure={openCustomizationDrawer}
        {workflows}
        {pinnedColumns}
        {empty}
        slot="headers"
      >
        {#each otherColumns as column}
          <TableHeaderCell {column} />
        {/each}
      </TableHeaderRow>
      {#each workflows as workflow}
        <TableRow {workflow}>
          {#each otherColumns as column}
            <TableBodyCell {column} {workflow} />
          {/each}
        </TableRow>
      {/each}
    </Table>
  </TableWrapper>
</div>

<Drawer
  open={customizationDrawerOpen}
  onClick={closeCustomizationDrawer}
  position="right"
  id="workflows-summary-table-configuration-drawer"
  dark={false}
  title={translate('workflows', 'configure-workflows')}
>
  <svelte:fragment slot="subtitle">
    Add (<Icon class="inline" name="add" />), re-arrange (<Icon
      class="inline"
      name="chevron-selector-vertical"
    />), and remove (<Icon class="inline" name="hyphen" />), Workflow Headings
    to personalize the Workflow List Table.
  </svelte:fragment>
  <WorkflowColumnsOrderableList {namespace} />
</Drawer>

<style lang="postcss">
  .workflows-summary-configurable-table {
    @apply flex flex-row w-full rounded-xl border-primary border-2 bg-white overflow-auto;
  }
</style>
