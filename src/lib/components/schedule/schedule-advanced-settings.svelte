<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import { translate } from '$lib/i18n/translate';

  import ScheduleNotes from './schedule-notes.svelte';

  import type { SchedulePolicies, ScheduleSpec, ScheduleState } from '$types';

  export let spec: ScheduleSpec;
  export let state: ScheduleState;
  export let policies: SchedulePolicies;
  export let notes = '';
</script>

<ScheduleNotes {notes} />
<Accordion title={translate('schedules.advanced-settings')}>
  <p>
    {translate('schedules.start-time')}
    {spec?.startTime ?? translate('common.none')}
  </p>
  <p>
    {translate('schedules.end-time')}{spec?.endTime ?? translate('common.none')}
  </p>
  <p>
    {translate('schedules.jitter')}{spec?.jitter ?? translate('common.none')}
  </p>
  <p>
    {translate('schedules.exclusion-calendar')}{spec?.excludeCalendar?.[0] ??
      translate('common.none')}
  </p>
  {#if state?.limitedActions}
    <p>
      {translate('schedules.start-time')}
      {spec?.startTime ?? translate('common.none')}
    </p>
    <p>
      {translate('schedules.end-time')}{spec?.endTime ??
        translate('common.none')}
    </p>
    <p>
      {translate('schedules.jitter')}{spec?.jitter ?? translate('common.none')}
    </p>
    <p>
      {translate('schedules.exclusion-calendar')}{spec?.excludeCalendar?.[0] ??
        translate('common.none')}
    </p>
    {#if state?.limitedActions}
      <p>
        {translate('schedules.remaining-actions')}{state?.remainingActions ??
          translate('common.none')}
      </p>
    {/if}
    <p>
      {translate('schedules.overlap-policy')}{policies?.overlapPolicy ??
        translate('common.none')}
    </p>
  {/if}
</Accordion>
