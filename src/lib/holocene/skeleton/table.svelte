<script lang="ts">
  import Table from '$lib/holocene/table/table.svelte';
  import Skeleton from './index.svelte';

  export let rows = 10;
</script>

<Table class="w-full border" variant="fancy">
  <tr slot="headers" class="h-10">
    <th />
  </tr>
  {#each Array.from(Array(rows).keys()) as _row}
    <tr class="flex gap-4 p-2">
      <Skeleton class="h-5 w-44" />
      <Skeleton class="h-5" />
      <Skeleton class="h-5 w-96" />
      <Skeleton class="h-5 w-96" />
    </tr>
  {/each}
</Table>
