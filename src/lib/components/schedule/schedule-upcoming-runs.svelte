<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  const runs = [
    {
      startTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      startTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      startTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      startTime: '2022-05-06T15:35:36.730883Z',
    },
    {
      startTime: '2022-05-06T15:35:36.730883Z',
    },
  ];
</script>

<Panel>
  <h2 class="text-2xl mb-4">Upcoming Runs</h2>
  {#each runs as run}
    <div class="row">
      <p>{formatDate(run.startTime, $timeFormat)}</p>
    </div>
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply inline-flex justify-start border-b-2 border-gray-300 my-1 py-1 w-full;
  }
</style>
