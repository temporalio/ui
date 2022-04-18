<section class="workflow-table">
  <div class="table-header-row md:table-header-group">
    <div class="md:table-row hidden">
      <div class="table-header rounded-tl-md w-24">Status</div>
      <div class="table-header">Workflow ID</div>
      <div class="table-header w-60">Type</div>
      <div class="table-header w-60">Start</div>
      <div class="table-header rounded-tr-md w-60">End</div>
    </div>
  </div>
  <div class="table-header-row md:hidden">
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
    @apply bg-gray-900 text-white rounded-t-lg;
  }

  .table-header {
    @apply table-cell text-left p-2;
  }
</style>
