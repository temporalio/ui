<section
  class="workflow-table border-collapse border-2 border-gray-300 overflow-hidden w-full rounded-lg"
>
  <div class="bg-gray-200 flex flex-row p-2">
    <div class="w-3/12 text-left">Workflow ID</div>
    <div class="w-3/12 text-left">Type</div>
    <div class="w-3/12 text-left">Status</div>
    <div class="w-2/12 text-left">Started</div>
    <div class="w-2/12 text-left">End</div>
  </div>
  <slot />
</section>

<!--  this style is mainly for keeping the height a certain level so the scroll
will feel more natural | may need revisions -->
<style lang="postcss">
  .workflow-table {
    height: calc(100vh - 25%);
  }
</style>
