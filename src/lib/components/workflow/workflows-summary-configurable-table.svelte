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

  export let workflows: WorkflowExecution[];

  let customizationDrawerOpen: boolean = false;

  $: empty = workflows.length === 0 || $workflowTableColumns.length === 0;
  $: pinnedColumns = $workflowTableColumns.filter((column) => column.pinned);
  $: otherColumns = $workflowTableColumns.filter((column) => !column.pinned);

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const closeCustomizationDrawer = () => {
    customizationDrawerOpen = false;
  };
</script>

<div class="workflows-summary-configurable-table">
  <TableWrapper noPinnedColumns={pinnedColumns.length === 0}>
    <Table pinned {empty} columns={pinnedColumns}>
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
    <Table {empty} columns={otherColumns} slot="unpinned-columns">
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
  <WorkflowColumnsOrderableList />
</Drawer>

<style lang="postcss">
  .workflows-summary-configurable-table {
    @apply flex flex-row w-full rounded-xl border-primary border-2 bg-white overflow-auto;
  }
</style>
