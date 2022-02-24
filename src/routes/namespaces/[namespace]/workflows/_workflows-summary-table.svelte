<section
  class="flex flex-col border-2 border-gray-300 w-full rounded-lg workflow-table"
>
  <div class="bg-gray-200 flex flex-row p-2">
    <div class="w-2/12 text-left">Status</div>
    <div class="w-3/12 text-left">Workflow ID</div>
    <div class="w-3/12 text-left">Type</div>
    <div class="w-2/12 text-left">Started</div>
    <div class="w-2/12 text-left">End</div>
  </div>
  <div class="overflow-y-auto">
    <slot />
  </div>
</section>

<style lang="postcss">
  .workflow-table {
    height: calc(100vh - 280px);
  }
</style>
