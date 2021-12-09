<section class="workflow-table border-collapse w-full rounded-lg">
  <div class="bg-gray-200">
    <span class="w-3/12 text-lefts">Name</span>
    <span class="w-3/12 text-left">Workflow ID</span>
    <span class="w-2/12 text-left">Status</span>
    <span class="w-2/12 text-left">Started</span>
    <span class="w-3/12 text-left">End</span>
  </div>
  <slot />
</section>

<style lang="postcss">
  .workflow-table {
    display: block;
    height: calc(100vh - 25%);
  }
</style>
