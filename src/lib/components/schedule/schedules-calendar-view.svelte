<script lang="ts">
  import type { Schedule } from '$types';
  import Tab from '$lib/holocene/tab.svelte';
  import SchedulesIntervalView from './schedules-interval-view.svelte';
  import ScheduleDayOfWeekView from './schedule-day-of-week-view.svelte';
  import ScheduleDayOfMonthView from './schedule-day-of-month-view.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { page } from '$app/stores';
  import ScheduleFrequency from './schedule-frequency.svelte';

  let scheduleId = $page.params.schedule;

  let preset: SchedulePreset = scheduleId ? 'existing' : 'interval';

  export let schedule: FullScheduleSpec | null = null;
  export let daysOfWeek: string[];
  export let daysOfMonth: number[];
  export let months: string[];
  export let days: string;
  export let hour: string;
  export let minute: string;
  export let second: string;
  export let phase: string;
  export let cronString: string;

  const clearSchedule = (_preset: SchedulePreset) => {
    daysOfWeek = [];
    daysOfMonth = [];
    months = [];
    days = '';
    hour = '';
    minute = '';
    second = '';
    phase = '';
    cronString = '';
  };

  $: {
    clearSchedule(preset);
  }
</script>

<div class="mt-8 w-full">
  <h1 class="mb-4 text-2xl">Frequency</h1>
  <div class="flex flex-wrap gap-6">
    {#if schedule}
      <Tab
        label="Existing"
        dataCy="interval-tab"
        active={preset === 'existing'}
        on:click={() => (preset = 'existing')}
      />
    {/if}
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
  <div class="mt-4 flex w-full flex-wrap gap-6">
    {#if preset === 'existing'}
      <ScheduleFrequency
        calendar={schedule?.spec?.structuredCalendar?.[0]}
        interval={schedule?.spec?.interval?.[0]}
        class="text-base"
      />
    {:else if preset === 'interval'}
      <SchedulesIntervalView
        bind:days
        bind:hour
        bind:minute
        bind:second
        bind:phase
      />
    {:else if preset === 'week'}
      <ScheduleDayOfWeekView bind:daysOfWeek bind:hour bind:minute />
    {:else if preset === 'month'}
      <ScheduleDayOfMonthView
        bind:daysOfMonth
        bind:months
        bind:hour
        bind:minute
      />
    {:else if preset === 'string'}
      <div class="flex w-full flex-col gap-2">
        <h3 class="text-base">String</h3>
        <p>Write or paste in a cron string to generate a schedule.</p>
        <Input
          id="cronString"
          bind:value={cronString}
          placeholder="* * * * *"
        />
      </div>
    {/if}
  </div>
  <slot {preset} />
</div>
