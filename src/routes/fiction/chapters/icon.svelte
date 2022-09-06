<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { icons } from '$lib/holocene/icon/paths';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
</script>

<Table variant="fancy" class="w-full">
  <TableHeaderRow slot="headers">
    <th>Icon Name</th>
    <th>Dark</th>
    <th>Light</th>
    <th>Large</th>
  </TableHeaderRow>
  {#each Object.keys(icons) as name}
    <TableRow>
      <td>{name}</td>
      <td>
        <Icon {name} />
      </td>
      <td class="bg-primary">
        <Icon {name} class="text-white" />
      </td>
      <td>
        <Icon {name} width={48} height={48} />
      </td>
    </TableRow>
  {/each}
</Table>
