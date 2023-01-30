<script lang="ts">
  import type { CalendarSpec, IntervalSpec } from '$types';

  import Panel from '$lib/components/panel.svelte';
  import ScheduleFrequency from './schedule-frequency.svelte';

  export let calendar: CalendarSpec | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Frequency</h2>
  <div class="pr-2">
    <ScheduleFrequency {calendar} {interval} class="text-base" />
  </div>
</Panel>
