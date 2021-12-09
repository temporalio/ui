<section class="workflow-table border-collapse w-full rounded-lg">
  <div class="bg-gray-200 flex flex-row p-2">
    <div class="w-6/12 text-left">Name</div>
    <div class="w-3/12 text-left">Workflow ID</div>
    <div class="w-2/12 text-left">Status</div>
    <div class="w-2/12 text-left">Started</div>
    <div class="w-3/12 text-left">End</div>
  </div>
  <slot />
</section>

<style lang="postcss">
  .workflow-table {
    display: block;
    height: calc(100vh - 25%);
  }
</style>
