<script lang="ts">
  import type { ScheduleSpec, ScheduleState, SchedulePolicies } from '$types';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  export let spec: ScheduleSpec;
  export let state: ScheduleState;
  export let policies: SchedulePolicies;

  let show = false;
</script>

<button on:click={() => (show = !show)} class="settings">
  {translate('schedules', 'advanced-settings')}
  <Icon class="inline" name={show ? 'chevron-up' : 'chevron-down'} />
</button>
{#if show}
  <p>
    {translate('schedules', 'start-time')}
    {spec?.startTime ?? 'None'}
  </p>
  <p>{translate('schedules', 'end-time')}{spec?.endTime ?? 'None'}</p>
  <p>{translate('schedules', 'jitter')}{spec?.jitter ?? 'None'}</p>
  <p>
    {translate('schedules', 'exclusion-calendar')}{spec?.excludeCalendar?.[0] ??
      'None'}
  </p>
  <p>
    {translate('schedules', 'remaining-actions')}{state?.remainingActions ?? 'None'}
  </p>
  <p>
    {translate('schedules', 'overlap-policy')}{policies?.overlapPolicy ?? 'None'}
  </p>
{/if}

<style lang="postcss">
  .settings {
    @apply mb-4 underline decoration-gray-900;
  }
</style>
