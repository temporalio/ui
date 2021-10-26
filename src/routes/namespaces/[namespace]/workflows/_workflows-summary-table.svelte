<table class="border-collapse w-full">
  <thead>
    <tr class="bg-gray-200">
      <th class="w-3/12 text-left dark:bg-gray-800 dark:text-gray-200"
        >Workflow Name</th
      >
      <th class="w-3/12 text-left dark:bg-gray-800 dark:text-gray-200"
        >Workflow ID</th
      >
      <th class="w-1/12 dark:bg-gray-800 dark:text-gray-200">Status</th>
      <th class="w-2/12 text-right dark:bg-gray-800 dark:text-gray-200"
        >Started</th
      >
      <th class="w-2/12 text-right dark:bg-gray-800 dark:text-gray-200"
        >Ended</th
      >
    </tr>
  </thead>
  <slot name="rows" />
</table>

<style lang="postcss">
  th {
    @apply bg-gray-200 text-gray-500 text-xs h-6 m-0 p-3 uppercase table-fixed;
  }
</style>
