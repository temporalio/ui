<script lang="ts">
  import type { TableColumn } from './types';

  export let columns: TableColumn[];
  // Need to measure column width since we can't use a tooltip and use overflow-hidden for text overflow
</script>

<div class="table-container">
  <div class="table-header-row xl:table-header-group">
    <div class="xl:table-row hidden">
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
    <div class="p-2 rounded-t-md">{columns[0].label}</div>
  </div>
  <div class="overflow-y-auto xl:table-row-group">
    <slot />
  </div>
</div>

<style lang="postcss">
  .table-container {
    @apply xl:table xl:table-fixed border-gray-900 border-2 rounded-lg w-full;
  }

  .table-header-row {
    @apply bg-gray-900 text-white text-lg rounded-t-sm xl:rounded-t-lg;
  }

  .table-header {
    @apply text-left p-2;
  }

  .table-header:first-of-type {
    @apply rounded-tl-md;
  }

  .table-header:last-of-type {
    @apply rounded-tr-md;
  }
</style>
