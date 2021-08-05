<table class="border-collapse w-full">
  <thead>
    <tr class="bg-gray-200">
      <th>Workflow/Run ID</th>
      <th>Status</th>
      <th>Started</th>
      <th>Ended</th>
    </tr>
  </thead>
  <slot name="rows" />
</table>

<style lang="postcss">
  th {
    @apply bg-gray-200 text-gray-500 text-xs h-6 m-0 p-3 text-left uppercase;
  }
</style>
