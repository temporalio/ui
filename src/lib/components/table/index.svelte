<script lang="ts">
  import type { TableColumn } from './types';

  export let columns: TableColumn[];
  // Need to measure column width since we can't use a tooltip and use overflow-hidden for text overflow
</script>

<div class="table-container">
  <div class="table-header-row xl:table-header-group">
    <div class="hidden xl:table-row">
      {#each columns as column (column.key)}
        <div class="table-header table-cell {column.classes}">
          {column.label}
          {#if columns.filter}
            <svelte:component this={column.filter} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
  <div class="table-header-row xl:hidden">
    <div class="rounded-t-md p-2">{columns[0].label}</div>
  </div>
  <div class="overflow-y-auto xl:table-row-group">
    <slot />
  </div>
</div>

<style lang="postcss">
  .table-container {
    @apply w-full rounded-lg border-2 border-gray-900 xl:table xl:table-fixed;
  }

  .table-header-row {
    @apply rounded-t-sm bg-gray-900 text-lg text-white xl:rounded-t-lg;
  }

  .table-header {
    @apply p-2 text-left;
  }

  .table-header:first-of-type {
    @apply rounded-tl-md;
  }

  .table-header:last-of-type {
    @apply rounded-tr-md;
  }
</style>
