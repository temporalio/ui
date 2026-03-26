<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { StructuredCalendar } from '$lib/types/schedule';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { IntervalSpec } from '$types';

  interface Props {
    frequency: (StructuredCalendar | IntervalSpec)[];
    timezoneName?: string;
  }

  let { frequency, timezoneName = 'UTC' }: Props = $props();

  const hasCronString = $derived(
    frequency.length > 0 && 'comment' in frequency[0] && !!frequency[0].comment,
  );
</script>

<Panel>
  <h2 class="mb-4">
    {hasCronString
      ? translate('schedules.cron-string')
      : translate('schedules.schedule-spec')}
  </h2>
  <div class="pr-2">
    <ScheduleFrequency {frequency} {timezoneName} class="text-base" />
  </div>
</Panel>
