<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import { translate } from '$lib/i18n/translate';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { ScheduleSpec } from '$types';

  interface Props {
    spec: ScheduleSpec;
  }

  let { spec }: Props = $props();

  const hasCronString = $derived(
    spec?.structuredCalendar?.length > 0 &&
      !!spec?.structuredCalendar[0].comment,
  );
</script>

<Panel>
  <h2 class="mb-4">
    {hasCronString
      ? translate('schedules.cron-string')
      : translate('schedules.schedule-spec')}
  </h2>
  <div class="pr-2">
    <ScheduleFrequency {spec} />
  </div>
</Panel>
