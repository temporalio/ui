<script lang="ts">
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  import SchedulesTimeView from './schedules-time-view.svelte';

  export let daysOfMonth: number[];
  export let months: string[];
  export let hour: string;
  export let minute: string;
</script>

<div class="my-2 flex flex-col gap-4">
  <h3>
    {translate('schedules.recurring-dates-heading')}
  </h3>
  <p>{translate('schedules.recurring-dates-description')}</p>
  <div class="flex w-full flex-col gap-4">
    <DayOfMonthPicker bind:daysOfMonth />
    <MonthPicker bind:months />
  </div>
</div>
<SchedulesTimeView bind:hour bind:minute />
