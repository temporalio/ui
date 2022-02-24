<section class="workflow-table ">
  <div class="bg-gray-100 hidden md:table-header-group ">
    <div class=" md:table-row ">
      <div class="table-header">Status</div>
      <div class="table-header">Workflow ID</div>
      <div class="table-header">Type</div>
      <div class="table-header">Started</div>
      <div class="table-header">End</div>
    </div>
  </div>
  <div class="md:hidden">
    <div class="bg-gray-100 p-2 border-b rounded-t-lg">Summary</div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .workflow-table {
    height: calc(100vh - 280px);
    @apply md:table  border-gray-300 border-2 rounded-lg w-full;
  }

  .table-header {
    @apply table-cell text-left p-2;
  }

  .table-header-group:first {
    @apply rounded-tl-lg;
  }
</style>
