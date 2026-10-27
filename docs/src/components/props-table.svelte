<script lang="ts" module>
  export type PropDefinition = readonly [
    name: string,
    type: string,
    defaultValue: string,
    description: string,
  ];
</script>

<script lang="ts">
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  let {
    componentName,
    rows,
  }: { componentName: string; rows: PropDefinition[] } = $props();
</script>

<Table
  class="text-left text-xs leading-relaxed [&_td]:!whitespace-normal [&_td]:!px-4 [&_td]:py-3 [&_td]:align-top [&_th]:!px-4"
>
  {#snippet caption()}<caption class="sr-only">{componentName} props</caption
    >{/snippet}
  {#snippet headers()}
    <TableHeaderRow>
      {#each ['Prop', 'Type', 'Default', 'Description'] as heading (heading)}<th
          scope="col">{heading}</th
        >{/each}
    </TableHeaderRow>
  {/snippet}
  {#each rows as row (row[0])}
    <TableRow>
      {#each row as cell, index (index)}<td
          class:font-mono={index < 3}
          class:text-secondary={index > 0}>{cell}</td
        >{/each}
    </TableRow>
  {/each}
</Table>
