<script lang="ts">
  import { fields, error } from '$lib/stores/schedules';

  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import Tab from '$lib/holocene/tab.svelte';
  import SchedulesTimeView from './schedules-time-view.svelte';
  import SchedulesIntervalView from './schedules-interval-view.svelte';
  import ScheduleDayOfWeekView from './schedule-day-of-week-view.svelte';
  import ScheduleDayOfMonthView from './schedule-day-of-month-view.svelte';

  let preset: SchedulePreset = 'month';
</script>

<div class="w-full mt-8">
  <h1 class="text-2xl mb-4">Frequency</h1>
  <div class="flex flex-wrap gap-6">
    <Tab
      label="Interval"
      dataCy="interval-tab"
      active={preset === 'interval'}
      on:click={() => (preset = 'interval')}
    />
    <Tab
      label="Days of the Week"
      dataCy="daily-tab"
      active={preset === 'week'}
      on:click={() => (preset = 'week')}
    />
    <Tab
      label="Days of the Month"
      dataCy="monthly-tab"
      active={preset === 'month'}
      on:click={() => (preset = 'month')}
    />
    <Tab
      label="String"
      dataCy="string-tab"
      active={preset === 'string'}
      on:click={() => (preset = 'string')}
    />
  </div>
  <div class="flex flex-wrap gap-6 w-full mt-4">
    {#if preset === 'interval'}
      <SchedulesIntervalView />
    {:else if preset === 'week'}
      <ScheduleDayOfWeekView />
    {:else if preset === 'month'}
      <ScheduleDayOfMonthView />
    {:else if preset === 'string'}
      <div class="flex flex-col gap-2 w-full">
        <h3 class="text-base">String</h3>
        <p>Write or paste in a cron string to generate a Schedule.</p>
        <FormInput field={fields.cronString} />
      </div>
    {/if}
  </div>
  <slot {preset} />
</div>

<style lang="postcss">
</style>
