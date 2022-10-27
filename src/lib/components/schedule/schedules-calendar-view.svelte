<script lang="ts">
  import { fields, error } from '$lib/stores/schedules';

  import FormInput from '$lib/holocene/forms/form-input.svelte';
  import MonthPicker from '$lib/holocene/month-picker.svelte';
  import DayOfMonthPicker from '$lib/holocene/day-of-month-picker.svelte';
  import DayOfWeekPicker from '$lib/holocene/day-of-week-picker.svelte';
  import Tab from '$lib/holocene/tab.svelte';
  import SchedulesTimeView from './schedules-time-view.svelte';

  let preset: SchedulePreset = 'interval';
</script>

<div class="flex flex-wrap gap-6 w-full justify-center mt-8">
  <Tab
    label="Interval"
    dataCy="interval-tab"
    active={preset === 'interval'}
    on:click={() => (preset = 'interval')}
  />
  <Tab
    label="Daily"
    dataCy="daily-tab"
    active={preset === 'daily'}
    on:click={() => (preset = 'daily')}
  />
  <Tab
    label="Weekly"
    dataCy="weekly-tab"
    active={preset === 'weekly'}
    on:click={() => (preset = 'weekly')}
  />
  <Tab
    label="Monthly"
    dataCy="monthly-tab"
    active={preset === 'monthly'}
    on:click={() => (preset = 'monthly')}
  />
  <Tab
    label="Yearly"
    dataCy="yearly-tab"
    active={preset === 'yearly'}
    on:click={() => (preset = 'yearly')}
  />
</div>
<div class="flex flex-wrap gap-6 w-full justify-center mt-4">
  {#if preset === 'interval'}
    <SchedulesTimeView />
  {:else if preset === 'daily'}
    <SchedulesTimeView />
  {:else if preset === 'weekly'}
    <DayOfWeekPicker field={fields.dayOfWeek} />
    <SchedulesTimeView />
  {:else if preset === 'monthly'}
    <DayOfMonthPicker />
    <SchedulesTimeView />
  {:else if preset === 'yearly'}
    <MonthPicker />
    <DayOfMonthPicker />
    <SchedulesTimeView />
  {:else if preset === 'string'}
    <FormInput field={fields.cronString} hideLabel />
  {/if}
</div>

<style lang="postcss">
</style>
