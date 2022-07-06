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
        {formatLabel(item?.[column.key], column.type) ?? ''}
      {/if}
    </div>
  {/each}
</a>

<style lang="postcss">
  .row {
    @apply block items-center border-b-2 p-2 text-sm no-underline last-of-type:border-b-0 xl:table-row xl:text-base;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .cell {
    @apply border-gray-700 p-2 text-left xl:table-cell xl:border-b-2;
  }

  .table-link {
    @apply group-hover:text-blue-700 group-hover:underline group-hover:decoration-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
