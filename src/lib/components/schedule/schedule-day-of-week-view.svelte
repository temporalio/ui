<script lang="ts">
  import { fields, error } from '$lib/stores/schedules';

  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import SchedulesTimeView from './schedules-time-view.svelte';

  let preset: SchedulePreset = 'month';
</script>

<DayOfWeekPicker />
<SchedulesTimeView />
