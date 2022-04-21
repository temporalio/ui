<script lang="ts">
  import {
    workflowIdColumnWidth,
    workflowTypeColumnWidth,
  } from '$lib/stores/column-width';

  // Need to measure column width since we can't use a tooltip and use overflow-hidden for text overflow
</script>

<section class="workflow-table">
  <div class="table-header-row md:table-header-group">
    <div class="md:table-row hidden">
      <div class="table-header table-cell rounded-tl-md w-28">Status</div>
      <div
        bind:offsetWidth={$workflowIdColumnWidth}
        class="table-header table-cell md:w-60 xl:w-auto"
      >
        Workflow ID
      </div>
      <div
        bind:offsetWidth={$workflowTypeColumnWidth}
        class="table-header table-cell md:w-60 xl:w-80"
      >
        Type
      </div>
      <div
        class="table-header hidden xl:table-cell xl:w-64 text-sm xl:text-base"
      >
        Start
      </div>
      <div class="table-header rounded-tr-md hidden xl:table-cell xl:w-64">
        End
      </div>
    </div>
  </div>
  <div
    class="table-header-row md:hidden"
    multiple
    bind:offsetWidth={$workflowIdColumnWidth}
  >
    <div class="p-2 border-b rounded-t-md">Summary</div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .workflow-table {
    @apply md:table md:table-fixed border-gray-900 border-2 rounded-lg w-full mb-6;
  }

  .table-header-row {
    @apply bg-gray-900 text-white rounded-t-sm md:rounded-t-lg;
  }

  .table-header {
    @apply text-left p-2;
  }
</style>
