<script lang="ts">
  import { page } from '$app/stores';

  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowTableColumns } from '$lib/stores/workflow-table-columns';
  import { updating, workflows } from '$lib/stores/workflows';

  import WorkflowColumnsOrderableList from './workflows-summary-configurable-table/orderable-list.svelte';
  import TableBodyCell from './workflows-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from './workflows-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './workflows-summary-configurable-table/table-header-row.svelte';
  import TableRow from './workflows-summary-configurable-table/table-row.svelte';

  let customizationDrawerOpen = false;

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
  <caption class="sr-only" slot="caption">
    {translate('workflows')}
  </caption>
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
  {#each visibleItems as workflow}
    <TableRow {workflow}>
      {#each columns as column}
        <TableBodyCell {workflow} {column} />
      {/each}
    </TableRow>
  {/each}
  <slot name="cloud" slot="cloud" />
</PaginatedTable>

<Drawer
  open={customizationDrawerOpen}
  onClick={closeCustomizationDrawer}
  position="right"
  id="workflows-summary-table-configuration-drawer"
  dark={false}
  title={translate('workflows', 'configure-workflows')}
  closeButtonLabel={translate('workflows', 'close-configure-workflows')}
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
