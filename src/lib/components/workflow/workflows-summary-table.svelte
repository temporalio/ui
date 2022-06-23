<section class="workflow-table">
  <div class="table-header-row md:table-header-group">
    <div class="hidden md:table-row">
      <div class="table-header table-cell w-28 rounded-tl-md">Status</div>
      <div class="table-header table-cell md:w-60 xl:w-auto">Workflow ID</div>
      <div class="table-header table-cell md:w-60 xl:w-80">Type</div>
      <div
        class="table-header hidden text-sm xl:table-cell xl:w-64 xl:text-base"
      >
        Start
      </div>
      <div class="table-header hidden rounded-tr-md xl:table-cell xl:w-64">
        End
      </div>
    </div>
  </div>
  <div class="table-header-row md:hidden">
    <div class="rounded-t-md border-b p-2">Summary</div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .workflow-table {
    @apply w-full rounded-lg border-2 border-gray-900 md:table md:table-fixed;
  }

  .table-header-row {
    @apply rounded-t-sm bg-gray-900 text-white md:rounded-t-lg;
  }

  .table-header {
    @apply p-2 text-left;
  }
</style>
