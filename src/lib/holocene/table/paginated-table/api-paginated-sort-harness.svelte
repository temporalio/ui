<script lang="ts" module>
  export type SortableItem = {
    name: string;
    count: string;
    started: string | null;
    enabled: boolean;
  };
  export const examplePages: SortableItem[][] = [
    [
      {
        name: 'Charlie',
        count: '10',
        started: '2026-01-03T00:00:00Z',
        enabled: true,
      },
      { name: 'Alpha', count: '2', started: null, enabled: false },
      {
        name: 'Bravo',
        count: '100',
        started: '2026-01-01T00:00:00Z',
        enabled: true,
      },
    ],
    [
      {
        name: 'Echo',
        count: '20',
        started: '2026-01-05T00:00:00Z',
        enabled: false,
      },
      {
        name: 'Delta',
        count: '3',
        started: '2026-01-04T00:00:00Z',
        enabled: true,
      },
    ],
  ];
</script>

<script lang="ts">
  import type { TableSort, TableSortColumn } from '$lib/utilities/table-sort';

  import ColumnResizeHandle from '../column-resize-handle.svelte';
  import SortableTableHeader from '../sortable-table-header.svelte';

  import ApiPaginated, { type PaginatedRequest } from './api-paginated.svelte';

  let {
    onFetch = async () => async (_size, token) => ({
      items: examplePages[token ? 1 : 0],
      nextPageToken: token ? '' : 'page-2',
    }),
    onItemsChange,
    total,
  }: {
    onFetch?: () => Promise<PaginatedRequest<SortableItem>>;
    onItemsChange?: (items: SortableItem[]) => void;
    total?: number;
  } = $props();
  let visibleItems = $state<SortableItem[]>([]);
  let sort = $state<TableSort>();
  let refreshKey = $state(0);
  let width = $state<number>();
  const buildSortColumns = (
    countType: TableSortColumn<SortableItem>['type'] = 'integer',
  ): Record<string, TableSortColumn<SortableItem>> => ({
    Name: { getValue: (item) => item.name, type: 'string' },
    Count: { getValue: (item) => item.count, type: countType },
    Started: { getValue: (item) => item.started, type: 'datetime' },
    Enabled: { getValue: (item) => item.enabled, type: 'boolean' },
  });
  let sortColumns = $state(buildSortColumns());

  export function rebuildSortColumns(
    countType?: TableSortColumn<SortableItem>['type'],
  ) {
    sortColumns = buildSortColumns(countType);
  }

  export function removeCountSort() {
    const { Count: _, ...remaining } = sortColumns;
    sortColumns = remaining;
  }

  export function refresh() {
    refreshKey += 1;
  }
</script>

{#key refreshKey}
  <ApiPaginated
    {onFetch}
    bind:sort
    {sortColumns}
    {total}
    onItemsChange={(items) => {
      visibleItems = items;
      onItemsChange?.(items);
    }}
    debounceDelay={0}
    pageSizeOptions={['3', '5']}
    pageSizeSelectLabel="Per page"
    previousButtonLabel="Previous"
    nextButtonLabel="Next"
    emptyStateTitle="No results"
  >
    {#snippet headers({ visibleItems: headerItems })}
      <tr data-header-items={headerItems.map((item) => item.name).join(',')}>
        <SortableTableHeader column="Name" />
        <SortableTableHeader
          column="Count"
          style={width ? `width: ${width}px` : undefined}
        >
          <ColumnResizeHandle
            label="Count"
            {width}
            onResize={(value) => (width = value)}
          />
        </SortableTableHeader>
        <SortableTableHeader column="Started" />
        <SortableTableHeader column="Enabled" />
        <SortableTableHeader column="Actions" />
      </tr>
    {/snippet}
    {#snippet rows()}
      {#each visibleItems as item (item.name)}
        <tr data-name={item.name}>
          <td>{item.name}</td><td>{item.count}</td><td>{item.started ?? '—'}</td
          ><td>{String(item.enabled)}</td><td></td>
        </tr>
      {/each}
    {/snippet}
    {#snippet actionsEndAdditional({ visibleItems: actionItems })}
      <span data-action-items={actionItems.map((item) => item.name).join(',')}
      ></span>
    {/snippet}
  </ApiPaginated>
{/key}
