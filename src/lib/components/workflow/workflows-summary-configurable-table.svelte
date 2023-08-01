<script lang="ts">
  import { workflowTableColumns } from '$lib/stores/workflow-table-columns';
  import { workflows, updating, workflowError } from '$lib/stores/workflows';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import TableHeaderCell from './workflows-summary-configurable-table/table-header-cell.svelte';
  import TableRow from './workflows-summary-configurable-table/table-row.svelte';
  import TableHeaderRow from './workflows-summary-configurable-table/table-header-row.svelte';
  import TableBodyCell from './workflows-summary-configurable-table/table-body-cell.svelte';
  import WorkflowColumnsOrderableList from './workflows-summary-configurable-table/orderable-list.svelte';
  import { translate } from '$lib/i18n/translate';
  import { page } from '$app/stores';

  let customizationDrawerOpen: boolean = false;

  $: ({ namespace } = $page.params);
  $: columns = $workflowTableColumns?.[namespace] ?? [];
  $: empty = $workflows.length === 0;

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const closeCustomizationDrawer = () => {
    customizationDrawerOpen = false;
  };
</script>

<PaginatedTable
  perPageLabel={translate('per-page')}
  nextPageButtonLabel={translate('next-page')}
  previousPageButtonLabel={translate('previous-page')}
  pageButtonLabel={(page) => translate('go-to-page', { page })}
  updating={$updating}
  items={$workflows}
  let:visibleItems
>
  <TableHeaderRow
    onClickConfigure={openCustomizationDrawer}
    workflows={visibleItems}
    columnsCount={columns.length}
    {empty}
    slot="headers"
  >
    {#each columns as column}
      <TableHeaderCell {column} />
    {/each}
  </TableHeaderRow>
  {#if columns.length > 0}
    {#each visibleItems as workflow}
      <TableRow {workflow}>
        {#each columns as column}
          <TableBodyCell {workflow} {column} />
        {/each}
      </TableRow>
    {:else}
      <TableRow empty>
        <td colspan={columns.length}>
          <EmptyState
            title="No Workflows Found"
            content="If you have filters applied, try adjusting them. Otherwise please check your syntax and try again."
            error={$workflowError}
          />
        </td>
      </TableRow>
    {/each}
  {:else}
    <TableRow empty>
      <td>
        <EmptyState title="No column headers are in view">
          <p class="text-center w-1/2">
            At least one column heading is required to display workflows. Click
            the <span class="whitespace-nowrap"
              >(<Icon class="inline" name="vertical-ellipsis" />)</span
            >
            in the top right corner of the Workflow List to reveal the Configure
            Workflow List panel. Click the
            <span class="whitespace-nowrap"
              >(<Icon class="inline" name="add" />)</span
            > to add column headings.
          </p>
        </EmptyState>
      </td>
    </TableRow>
  {/if}
</PaginatedTable>

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
