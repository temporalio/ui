<svelte:options runes />

<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';

  import Table from '$lib/holocene/table/table.svelte';

  export const meta = {
    title: 'Table',
    component: Table,
    args: {
      columns: 3,
      rows: 3,
    },
    argTypes: {
      columns: { control: 'number' },
      rows: { control: 'number' },
    },
  } satisfies Meta<
    Omit<Table, 'columns' | 'rows'> & { columns?: number; rows?: number }
  >;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';

  const totalRows = Array.from({ length: 40 }, (_, i) => ({
    name: `Item ${i + 1}`,
    requests: (i + 1) * 100,
    storage: (i + 1) * 3,
  }));
  const totalRequests = totalRows.reduce((sum, row) => sum + row.requests, 0);
  const totalStorage = totalRows.reduce((sum, row) => sum + row.storage, 0);
</script>

<Template let:args let:context>
  <Table class="w-full" updating={args.updating} data-testid={context.id}>
    <tr slot="headers">
      {#each Array(args.columns) as _, index}
        <th>Heading {index + 1}</th>
      {/each}
    </tr>
    {#each Array(args.rows) as _}
      <tr>
        {#each Array(args.columns) as _, colIdx}
          <td>Cell {colIdx + 1}</td>
        {/each}
      </tr>
    {/each}
  </Table>
</Template>

<Story name="Primary" args={{ variant: 'primary' }} />

<Story name="Primary, Updating" args={{ updating: true, variant: 'primary' }} />

<Story name="Pinned Total Row">
  <div class="h-72 overflow-auto border border-subtle">
    <Table class="w-full" bordered={false}>
      <tr slot="headers">
        <th>Name</th>
        <th>Requests</th>
        <th>Storage (GB)</th>
      </tr>
      {#each totalRows as row (row.name)}
        <tr>
          <td>{row.name}</td>
          <td class="font-mono tabular-nums">{row.requests.toLocaleString()}</td
          >
          <td class="font-mono tabular-nums">{row.storage.toLocaleString()}</td>
        </tr>
      {/each}
      <tr slot="footer">
        <td>Total</td>
        <td class="font-mono tabular-nums">{totalRequests.toLocaleString()}</td>
        <td class="font-mono tabular-nums">{totalStorage.toLocaleString()}</td>
      </tr>
    </Table>
  </div>
</Story>

<Story name="Pinned Total Row, Above Footer Bar">
  <div class="flex h-72 flex-col overflow-auto border border-subtle">
    <Table class="w-full [--table-footer-bottom:2.75rem]" bordered={false}>
      <tr slot="headers">
        <th>Name</th>
        <th>Requests</th>
        <th>Storage (GB)</th>
      </tr>
      {#each totalRows as row (row.name)}
        <tr>
          <td>{row.name}</td>
          <td class="font-mono tabular-nums">{row.requests.toLocaleString()}</td
          >
          <td class="font-mono tabular-nums">{row.storage.toLocaleString()}</td>
        </tr>
      {/each}
      <tr slot="footer">
        <td>Total</td>
        <td class="font-mono tabular-nums">{totalRequests.toLocaleString()}</td>
        <td class="font-mono tabular-nums">{totalStorage.toLocaleString()}</td>
      </tr>
    </Table>
    <div
      class="surface-primary sticky bottom-0 left-0 flex h-11 w-full shrink-0 items-center justify-end gap-2 border-t border-subtle px-4"
    >
      <span class="text-sm text-secondary">Pagination controls</span>
    </div>
  </div>
</Story>
