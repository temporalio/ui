<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;

  let bulkActionsAvailable = true;
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

  <svelte:fragment slot="controls">
    <Hst.Checkbox
      bind:value={bulkActionsAvailable}
      title="Bulk Actions Available:"
    />
    <Hst.Checkbox bind:value={updating} title="Show Progress Bar:" />
  </svelte:fragment>
</Hst.Story>
