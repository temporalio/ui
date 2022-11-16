<script lang="ts">
  import SchedulesTimeView from './schedules-time-view.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';

  export let daysOfMonth: number[];
  export let months: string[];
  export let hour: string;
  export let minute: string;
</script>

<div class="my-2 flex flex-col gap-4">
  <h3 class="text-lg font-medium">Recurring date(s)</h3>
  <p>Select the specific dates for the schedule to always run on.</p>
  <div class="flex w-full flex-col gap-4">
    <DayOfMonthPicker bind:daysOfMonth />
    <MonthPicker bind:months />
  </div>
</div>
<SchedulesTimeView bind:hour bind:minute />
