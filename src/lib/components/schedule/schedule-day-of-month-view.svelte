<script lang="ts">
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  import SchedulesTimeView from './schedules-time-view.svelte';

  export let daysOfMonth: number[];
  export let months: string[];
  export let hour: string;
  export let minute: string;
  export let timezoneName: string;
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
  <SchedulesTimeView bind:hour bind:minute bind:timezoneName />
</div>
