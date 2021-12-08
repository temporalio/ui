<table class="border-collapse w-full rounded-lg">
  <thead>
    <tr class="bg-gray-200">
      <th class="w-3/12 text-left ">Name</th>
      <th class="w-3/12 text-left">Workflow ID</th>
      <th class="w-2/12 text-left">Status</th>
      <th class="w-2/12 text-left">Started</th>
      <th class="w-3/12 text-left">End</th>
    </tr>
  </thead>
  <slot name="rows" />
</table>

<style lang="postcss">
  table {
    @apply overflow-hidden;
  }
  thead {
    @apply block bg-gray-200 h-12;
  }
  tr {
    @apply w-full flex;
  }
  th {
    @apply text-gray-500 text-sm h-6 m-0 p-3 table-fixed;
  }
</style>
