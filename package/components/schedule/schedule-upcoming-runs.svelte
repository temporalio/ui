<script>import Panel from '../panel.svelte';
import { formatDate } from '../../utilities/format-date';
import { timeFormat } from '../../stores/time-format';
export let futureRuns = [];
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Upcoming Runs</h2>
  {#each futureRuns.slice(0, 5) as run}
    <div class="row">
      <p>{formatDate(run, $timeFormat, 'from now')}</p>
    </div>
  {/each}
</Panel>

<style>
  .row {
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    display: inline-flex;
    height: 2.5rem;
    width: 100%;
    justify-content: flex-start;
    border-bottom-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(212 212 216 / var(--tw-border-opacity));
    padding-top: 0.25rem;
    padding-bottom: 0.25rem
}</style>
