<script lang="ts">
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import { translate } from '$lib/i18n/translate';

  import SchedulesTimeView from './schedules-time-view.svelte';

  export let daysOfWeek: string[];
  export let hour: string;
  export let minute: string;
</script>

<div class="my-2 flex flex-col gap-4">
  <h3>
    {translate('schedules.recurring-days-heading')}
  </h3>
  <p>{translate('schedules.recurring-days-description')}</p>
  <DayOfWeekPicker bind:daysOfWeek />
</div>
<SchedulesTimeView bind:hour bind:minute />
