<script lang="ts">
  import type { Timestamp } from '$types';
  import Panel from '$lib/components/panel.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  export let futureRuns: Timestamp[] = [];
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Upcoming Runs</h2>
  {#each futureRuns.slice(0, 5) as run}
    <div class="row">
      <p>{formatDate(run, $timeFormat, 'from now')}</p>
    </div>
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply my-1 inline-flex h-10 w-full justify-start border-b-2 border-gray-300 py-1;
  }
</style>
