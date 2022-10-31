<script lang="ts">
  import { fields, error } from '$lib/stores/schedules';

  import SchedulesTimeView from './schedules-time-view.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';

  export let dayOfMonth;
  export let month;
</script>

<div class="flex w-full flex-col gap-4">
  <DayOfMonthPicker bind:dayOfMonth />
  <MonthPicker bind:month />
</div>
<SchedulesTimeView />
