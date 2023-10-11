<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import { translate } from '$lib/i18n/translate';

  import ScheduleNotes from './schedule-notes.svelte';

  import type { SchedulePolicies, ScheduleSpec, ScheduleState } from '$types';

  export let spec: ScheduleSpec;
  export let state: ScheduleState;
  export let policies: SchedulePolicies;
  $: {
    console.log('Policies: ', policies?.overlapPolicy);
  }
  export let notes = '';
</script>

<ScheduleNotes {notes} />
<Accordion title={translate('schedules', 'advanced-settings')}>
  <p>
    {translate('schedules', 'start-time')}
    {spec?.startTime ?? translate('none')}
  </p>
  <p>
    {translate('schedules', 'end-time')}{spec?.endTime ?? translate('none')}
  </p>
  <p>{translate('schedules', 'jitter')}{spec?.jitter ?? translate('none')}</p>
  <p>
    {translate('schedules', 'exclusion-calendar')}{spec?.excludeCalendar?.[0] ??
      translate('none')}
  </p>
  {#if state?.limitedActions}
    <p>
      {translate('schedules', 'remaining-actions')}{state?.remainingActions ??
        translate('none')}
    </p>
  {/if}
  <p>
    {translate('schedules', 'overlap-policy')}{policies?.overlapPolicy ??
      translate('none')}
  </p>
</Accordion>
