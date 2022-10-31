<script lang="ts">
  import { fields, error } from '$lib/stores/schedules';

  import SchedulesTimeView from './schedules-time-view.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';

  let preset: SchedulePreset = 'month';
</script>

<div class="flex flex-col gap-4 w-full">
  <DayOfMonthPicker />
  <MonthPicker />
</div>
<SchedulesTimeView />
