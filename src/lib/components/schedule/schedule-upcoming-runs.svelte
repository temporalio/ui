<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  export let futureRuns = [];
</script>

<Panel>
  <h2 class="text-2xl mb-4">Upcoming Runs</h2>
  {#each futureRuns as run}
    <div class="row">
      <p>{formatDate(run, $timeFormat, 'from now')}</p>
    </div>
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply inline-flex justify-start border-b-2 border-gray-300 my-1 py-1 w-full;
  }
</style>
