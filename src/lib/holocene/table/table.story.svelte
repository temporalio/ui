<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import BulkActionButton from './bulk-action-button.svelte';
  import SelectableTable from './selectable-table.svelte';
  import SelectableTableRow from './selectable-table-row.svelte';

  export let Hst: HST;

  type MockWorkflow = {
    id: string;
    status: string;
    type: string;
    start: string;
    end: string;
  };

  const workflows: MockWorkflow[] = [
    {
      status: 'Running',
      id: 'abc-123',
      type: 'Payments',
      start: '2022-02-18 UTC 20:30:04:39',
      end: '2022-02-18 UTC 20:30:04:39',
    },
    {
      status: 'Running',
      id: 'def-456',
      type: 'Check-inventory',
      start: '2022-02-18 UTC 20:30:04:39',
      end: '2022-02-18 UTC 20:30:04:39',
    },
    {
      status: 'Running',
      id: 'ghi-789',
      type: 'Auth-login',
      start: '2022-02-18 UTC 20:30:04:39',
      end: '2022-02-18 UTC 20:30:04:39',
    },
    {
      status: 'Running',
      id: 'jkl-012',
      type: 'Payments',
      start: '2022-02-18 UTC 20:30:04:39',
      end: '2022-02-18 UTC 20:30:04:39',
    },
    {
      status: 'Running',
      id: 'mno-345',
      type: 'Payments',
      start: '2022-02-18 UTC 20:30:04:39',
      end: '2022-02-18 UTC 20:30:04:39',
    },
  ];

  let bulkActionsAvailable = true;
  let selectedItems: MockWorkflow[] = [];
  const handleSelectedItemsChange = (event: CustomEvent<MockWorkflow[]>) => {
    selectedItems = event.detail;
  };

  let updating: boolean = false;
</script>

<Hst.Story>
  <Hst.Variant title="A Fancy Table">
    <Table variant="fancy" class="w-full" bind:updating>
      <TableHeaderRow slot="headers">
        <th class="w-1/5">Status</th>
        <th class="w-1/5">Email</th>
        <th>Role</th>
      </TableHeaderRow>
      <TableRow>
        <td>
          <Badge type="active">Active</Badge>
        </td>
        <td>george@temporal.io</td>
        <td>Global Admin</td>
      </TableRow>
      <TableRow>
        <td>
          <Badge type="active">Active</Badge>
        </td>
        <td>lucile@temporal.io</td>
        <td>Developer</td>
      </TableRow>
      <TableRow>
        <td>
          <Badge type="active">Active</Badge>
        </td>
        <td>tobias@temporal.io</td>
        <td>Read-Only</td>
      </TableRow>
    </Table>
  </Hst.Variant>

  <Hst.Variant title="A Simple Table">
    <Table variant="simple" class="w-full">
      <tr slot="headers">
        <th>Attribute</th>
        <th>Type</th>
      </tr>
      <tr>
        <td>searchAttribute1</td>
        <td>Unspecified</td>
      </tr>
      <tr>
        <td>searchAttribute2</td>
        <td>Text</td>
      </tr>
      <tr>
        <td>searchAttribute3</td>
        <td>Keyword</td>
      </tr>
    </Table>
  </Hst.Variant>

  <Hst.Variant title="A Table with Selectable Rows">
    <SelectableTable items={workflows} on:change={handleSelectedItemsChange}>
      <svelte:fragment slot="bulk-action-headers">
        <th class="w-24">
          {selectedItems.length} Selected
        </th>
        <th class="w-1/6">
          {#if bulkActionsAvailable}
            <BulkActionButton>Terminate</BulkActionButton>
          {:else}
            <span class="absolute top-3 whitespace-nowrap italic">
              No bulk actions available for selected workflows
            </span>
          {/if}
        </th>
        <th />
        <th class="w-64" />
        <th class="w-64" />
      </svelte:fragment>
      <svelte:fragment slot="default-headers">
        <th class="w-24">Status</th>
        <th class="w-1/6">Workflow ID</th>
        <th>Type</th>
        <th class="w-64">Start</th>
        <th class="w-64">End</th>
      </svelte:fragment>
      {#each workflows as workflow}
        <SelectableTableRow
          selected={selectedItems.includes(workflow)}
          item={workflow}
        >
          <td>
            <Badge type="running">
              {workflow.status}
            </Badge>
          </td>
          <td>{workflow.id}</td>
          <td>{workflow.type}</td>
          <td>{workflow.start}</td>
          <td>{workflow.end}</td>
        </SelectableTableRow>
      {/each}
    </SelectableTable>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox
      bind:value={bulkActionsAvailable}
      title="Bulk Actions Available:"
    />
    <Hst.Checkbox bind:value={updating} title="Show Progress Bar:" />
  </svelte:fragment>
</Hst.Story>
