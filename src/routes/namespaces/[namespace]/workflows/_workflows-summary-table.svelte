<table class="border-collapse w-full">
  <thead>
    <tr class="bg-gray-200">
      <th class="w-2/12 text-left ">Workflow Name</th>
      <th class="w-4/12 text-left">Workflow/Run ID</th>
      <th class="w-2/12">Status</th>
      <th class="w-2/12 text-right">Started</th>
      <th class="w-2/12 text-right">Ended</th>
    </tr>
  </thead>
  <slot name="rows" />
</table>

<style lang="postcss">
  th {
    @apply bg-gray-200 text-gray-500 text-xs h-6 m-0 p-3 uppercase table-fixed;
  }
</style>
