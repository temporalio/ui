<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import type { TableColumn } from './types';

  export let columns: TableColumn[];
  export let href: string;
  export let item: unknown;
  export let timeFormat: TimeFormat | string;

  const getProps = (properties: string[], item: unknown) => {
    const props = {};
    for (const prop of properties) {
      if (item[prop]) {
        props[prop] = item[prop];
      }
    }
    return props;
  };

  $: formatLabel = (value: string, type) => {
    if (type === 'dateTime') {
      return formatDate(value, timeFormat);
    }
    return value;
  };
</script>

<a {href} class="row">
  {#each columns as column (column.key)}
    <div class="cell {column.cellClasses}">
      {#if column.component}
        <svelte:component
          this={column.component}
          {...getProps(column.props, item)}
        />
      {:else}
        {formatLabel(item?.[column.key], column.type) ??
          'temporal-sys-scheduler-workflow'}
      {/if}
    </div>
  {/each}
</a>

<style lang="postcss">
  .row {
    @apply block no-underline p-2 text-sm border-b-2 items-center xl:text-base xl:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .cell {
    @apply xl:table-cell xl:border-b-2 border-gray-700 text-left p-2;
  }

  .table-link {
    @apply group-hover:text-blue-700 group-hover:underline group-hover:decoration-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
