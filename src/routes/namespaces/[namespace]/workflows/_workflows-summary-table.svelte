<section class="workflow-table">
  <div class="md:table-header-group bg-gray-100 rounded-t-lg">
    <div class="md:table-row hidden">
      <div class="table-header rounded-tl-lg">Status</div>
      <div class="table-header">Workflow ID</div>
      <div class="table-header">Type</div>
      <div class="table-header">Started</div>
      <div class="table-header rounded-tr-lg">End</div>
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
    @apply md:table border-gray-300 border-2 rounded-lg w-full mb-6;
  }

  .table-header {
    @apply table-cell text-left p-2;
  }

  .table-header-group:first {
    @apply rounded-tl-lg;
  }
</style>
