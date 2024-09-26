<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
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
  <ul class="settings-list">
    <li>
      {translate('schedules.start-time')}
      <span> {spec?.startTime ?? translate('common.none')}</span>
    </li>
    <li>
      {translate('schedules.end-time')}
      <span>{spec?.endTime ?? translate('common.none')} </span>
    </li>
    <li>
      {translate('schedules.jitter')}
      <span>{spec?.jitter ?? translate('common.none')} </span>
    </li>

    <li>
      {translate('schedules.exclusion-calendar')}
      <span> {spec?.excludeCalendar?.[0] ?? translate('common.none')}</span>
    </li>
    {#if state?.limitedActions}
      <li>
        {translate('schedules.remaining-actions')}
        <span>{state?.remainingActions ?? translate('common.none')} </span>
      </li>
    {/if}
    <li>
      {translate('schedules.overlap-policy')}
      <span>{policies?.overlapPolicy ?? translate('common.none')} </span>
    </li>
  </ul>
</Accordion>

<style lang="postcss">
  .settings-list {
    @apply w-full;

    li {
      @apply flex flex-wrap items-center gap-2 border-b py-2 last-of-type:border-b-0;

      span {
        @apply surface-subtle select-all rounded-sm p-1 leading-4;
      }
    }
  }
</style>
