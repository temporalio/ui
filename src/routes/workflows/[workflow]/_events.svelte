<script lang="ts">
  import Event from './_event.svelte';
  import { History } from '$types/temporal/api/history/v1/message';

  export let history: History;
</script>

<section>
  <h2 class="text-lg">Events</h2>

  <table class="border-collapse w-full border-2">
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Time</th>
        <th>Details</th>
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
