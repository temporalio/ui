<script lang="ts">
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import SchedulesTimeView from './schedules-time-view.svelte';

  export let daysOfWeek: string[];
  export let hour: string;
  export let minute: string;
</script>

<div class="my-2 flex flex-col gap-4">
  <h3 class="text-lg font-medium">Recurring day(s)</h3>
  <p>Select the day(s) of the week this schedule will always run on.</p>
  <DayOfWeekPicker bind:daysOfWeek />
</div>
<SchedulesTimeView bind:hour bind:minute />
