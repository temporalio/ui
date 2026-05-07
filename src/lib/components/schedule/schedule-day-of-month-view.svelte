<script lang="ts">
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  import SchedulesTimeView from './schedules-time-view.svelte';

  interface Props {
    daysOfMonth: number[];
    months: string[];
    hour: string;
    minute: string;
    timezoneName: string;
  }

  let {
    daysOfMonth = $bindable(),
    months = $bindable(),
    hour = $bindable(),
    minute = $bindable(),
    timezoneName,
  }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h3>
      {translate('schedules.recurring-dates-heading')}
    </h3>
    <p class="text-secondary">
      {translate('schedules.recurring-dates-description')}
    </p>

    <DayOfMonthPicker bind:daysOfMonth />
  </div>
  <MonthPicker bind:months />
  <SchedulesTimeView bind:hour bind:minute {timezoneName} />
</div>
