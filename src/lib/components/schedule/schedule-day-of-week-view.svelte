<script lang="ts">
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import SchedulesTimeView from './schedules-time-view.svelte';

  export let dayOfWeek: string;
  export let hour: string;
  export let minute: string;
</script>

<div class="my-4 flex flex-col gap-4">
  <h3 class="text-base">Days of the Week</h3>
  <p>Select the day(s) of the week this schedule will always run on.</p>
  <DayOfWeekPicker bind:dayOfWeek />
</div>
<SchedulesTimeView bind:hour bind:minute />
