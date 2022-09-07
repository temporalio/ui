<script>import Panel from '../panel.svelte';
import ScheduleFrequency from './schedule-frequency.svelte';
export let calendar;
export let interval;
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Frequency</h2>
  <div class="pr-2">
    <ScheduleFrequency {calendar} {interval} />
  </div>
</Panel>
