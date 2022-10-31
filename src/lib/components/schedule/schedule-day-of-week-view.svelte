<script lang="ts">
  import { fields, error } from '$lib/stores/schedules';

  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import SchedulesTimeView from './schedules-time-view.svelte';

  export let dayOfWeek;
</script>

<DayOfWeekPicker bind:dayOfWeek />
<SchedulesTimeView />
