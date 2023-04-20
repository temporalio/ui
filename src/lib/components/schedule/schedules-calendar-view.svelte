<script lang="ts">
  import Tab from '$lib/holocene/tab/tab.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import SchedulesIntervalView from './schedules-interval-view.svelte';
  import ScheduleDayOfWeekView from './schedule-day-of-week-view.svelte';
  import ScheduleDayOfMonthView from './schedule-day-of-month-view.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { page } from '$app/stores';
  import ScheduleFrequency from './schedule-frequency.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import type { FullSchedule, SchedulePreset } from '$lib/types/schedule';

  let scheduleId = $page.params.schedule;

  let preset: SchedulePreset = scheduleId ? 'existing' : 'interval';

  export let schedule: FullSchedule | null = null;
  export let daysOfWeek: string[];
  export let daysOfMonth: number[];
  export let months: string[];
  export let days: string;
  export let hour: string;
  export let minute: string;
  export let second: string;
  export let phase: string;
  export let cronString: string;

  const clearSchedule = () => {
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

  $: clearSchedule();
</script>

<Tabs class="mt-8 w-full">
  <h2 class="mb-4 text-2xl">Frequency</h2>
  <TabList label="Schedule Tabs" class="flex flex-wrap gap-6">
    {#if schedule}
      <Tab
        label="Existing"
        id="existing-tab"
        panelId="existing-panel"
        onClick={() => (preset = 'existing')}
      />
    {/if}
    <Tab
      label="Interval"
      id="interval-tab"
      panelId="interval-panel"
      onClick={() => (preset = 'interval')}
    />
    <Tab
      label="Days of the Week"
      id="daily-tab"
      panelId="daily-panel"
      onClick={() => (preset = 'week')}
    />
    <Tab
      label="Days of the Month"
      id="monthly-tab"
      panelId="monthly-panel"
      onClick={() => (preset = 'month')}
    />
    <Tab
      label="String"
      id="string-tab"
      panelId="string-panel"
      onClick={() => (preset = 'string')}
    />
  </TabList>
  <div class="mt-4 flex w-full flex-wrap gap-6">
    {#if schedule}
      <TabPanel id="existing-panel" tabId="existing-tab">
        <ScheduleFrequency
          calendar={schedule?.spec?.structuredCalendar?.[0]}
          interval={schedule?.spec?.interval?.[0]}
          class="text-base"
        />
      </TabPanel>
    {/if}
    <TabPanel id="interval-panel" tabId="interval-tab">
      <SchedulesIntervalView
        bind:days
        bind:hour
        bind:minute
        bind:second
        bind:phase
      />
    </TabPanel>
    <TabPanel id="daily-panel" tabId="daily-tab">
      <ScheduleDayOfWeekView bind:daysOfWeek bind:hour bind:minute />
    </TabPanel>
    <TabPanel id="monthly-panel" tabId="monthly-tab">
      <ScheduleDayOfMonthView
        bind:daysOfMonth
        bind:months
        bind:hour
        bind:minute
      />
    </TabPanel>
    <TabPanel id="string-panel" tabId="string-tab">
      <div class="my-2 flex w-full flex-col gap-4">
        <h3 class="text-lg font-medium">String</h3>
        <p>Write or paste in a cron string to generate a schedule.</p>
        <Input
          id="cronString"
          bind:value={cronString}
          placeholder="* * * * *"
        />
      </div>
    </TabPanel>
  </div>
  <slot {preset} />
</Tabs>
