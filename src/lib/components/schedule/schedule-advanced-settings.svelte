<script lang="ts">
  import Accordion from '$lib/holocene/accordion.svelte';
  import { createTranslate, translate } from '$lib/i18n/translate';

  import ScheduleNotes from './schedule-notes.svelte';

  import type { SchedulePolicies, ScheduleSpec, ScheduleState } from '$types';
  const t = createTranslate('schedules');
  export let spec: ScheduleSpec;
  export let state: ScheduleState;
  export let policies: SchedulePolicies;
  export let notes = '';
</script>

<ScheduleNotes {notes} />
<Accordion title={t('advanced-settings')}>
  <p>
    {t('start-time')}
    {spec?.startTime ?? translate('none')}
  </p>
  <p>
    {t('end-time')}{spec?.endTime ?? translate('none')}
  </p>
  <p>{t('jitter')}{spec?.jitter ?? translate('none')}</p>
  <p>
    {t('exclusion-calendar')}{spec?.excludeCalendar?.[0] ?? translate('none')}
  </p>
  {#if state?.limitedActions}
    <p>
      {t('start-time')}
      {spec?.startTime ?? translate('none')}
    </p>
    <p>
      {t('end-time')}{spec?.endTime ?? translate('none')}
    </p>
    <p>{t('jitter')}{spec?.jitter ?? translate('none')}</p>
    <p>
      {t('exclusion-calendar')}{spec?.excludeCalendar?.[0] ?? translate('none')}
    </p>
    {#if state?.limitedActions}
      <p>
        {t('remaining-actions')}{state?.remainingActions ?? translate('none')}
      </p>
    {/if}
    <p>
      {t('overlap-policy')}{policies?.overlapPolicy ?? translate('none')}
    </p>
  {/if}
</Accordion>
