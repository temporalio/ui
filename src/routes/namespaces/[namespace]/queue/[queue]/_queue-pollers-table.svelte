<table class="border-collapse w-full">
  <thead>
    <tr class="bg-gray-200">
      <th class="w-6/12">Identity</th>
      <th class="w-2/12">Last Access Time</th>
      <th class="w-2/12">WORKFLOW TASK HANDLER</th>
      <th class="w-2/12">ACTIVITY HANDLER</th>
    </tr>
  </thead>
  <slot name="rows" />
</table>

<style lang="postcss">
  th {
    @apply bg-gray-200 text-gray-500 text-xs h-6 m-0 p-3 text-left uppercase table-fixed;
  }
</style>
