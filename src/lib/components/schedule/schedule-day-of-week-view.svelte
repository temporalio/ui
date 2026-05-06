<script lang="ts">
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  import SchedulesTimeView from './schedules-time-view.svelte';

  type Props = {
    daysOfWeek: string[];
    hour: string;
    minute: string;
    timezoneName: string;
  };

  let {
    daysOfWeek = $bindable(),
    hour = $bindable(),
    minute = $bindable(),
    timezoneName,
  }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h3>
      {translate('schedules.recurring-days-heading')}
    </h3>
    <p class="text-secondary">
      {translate('schedules.recurring-days-description')}
    </p>
    <DayOfWeekPicker bind:daysOfWeek />
  </div>
  <SchedulesTimeView bind:hour bind:minute {timezoneName} />
</div>
