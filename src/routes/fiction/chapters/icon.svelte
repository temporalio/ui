<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { IconName, icons } from '$lib/holocene/icon/paths';
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';

  // gross casting because Object.keys isn't generic and always returns string[]
  const iconNames: IconName[] = Object.keys(icons) as IconName[];
</script>

<Table variant="fancy" class="w-full">
  <TableHeaderRow slot="headers">
    <th>Icon Name</th>
    <th>Dark</th>
    <th>Light</th>
    <th>Large</th>
  </TableHeaderRow>
  {#each iconNames as name}
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
