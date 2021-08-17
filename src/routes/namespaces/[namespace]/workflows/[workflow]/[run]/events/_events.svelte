<script lang="ts">
  import Event from './_event.svelte';
  import type { History } from '$types/temporal/api/history/v1/message';

  export let history: History;
</script>

<section>
  <table class="border-collapse w-full border-2 table-fixed">
    <thead>
      <tr>
        <th class="w-1/12">ID</th>
        <th class="w-2/12">Type</th>
        <th class="w-2/12">Time</th>
        <th class="w-7/12">Details</th>
      </tr>
    </thead>
    <tbody>
      {#each history.events as event, index}
        <Event {event} {index} />
      {/each}
    </tbody>
  </table>
</section>

<style lang="postcss">
  th {
    @apply bg-gray-200 text-gray-500 text-xs h-6 m-0 p-3 text-left uppercase;
  }
</style>
