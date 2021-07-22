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
    @apply bg-gray-200;
    @apply text-gray-500;
    @apply text-xs;
    @apply h-6;
    @apply m-0;
    @apply p-3;
    @apply text-left;
    @apply uppercase;
  }
</style>
