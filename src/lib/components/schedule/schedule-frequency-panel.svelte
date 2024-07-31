<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { StructuredCalendar } from '$lib/types/schedule';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { IntervalSpec } from '$types';

  export let calendar: StructuredCalendar | undefined = undefined;
  export let interval: IntervalSpec | undefined = undefined;
  export let timezoneName: string = 'UTC';
</script>

<Panel>
  <h2 class="mb-4">{translate('schedules.schedule-spec')}</h2>
  <div class="pr-2">
    <ScheduleFrequency {calendar} {interval} {timezoneName} class="text-base" />
  </div>
</Panel>
