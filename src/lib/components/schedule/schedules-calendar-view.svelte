<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { FullSchedule, SchedulePreset } from '$lib/types/schedule';

  import ScheduleDayOfMonthView from './schedule-day-of-month-view.svelte';
  import ScheduleDayOfWeekView from './schedule-day-of-week-view.svelte';
  import ScheduleFrequency from './schedule-frequency.svelte';
  import SchedulesIntervalView from './schedules-interval-view.svelte';

  type Props = {
    schedule: FullSchedule | null;
    daysOfWeek: string[];
    daysOfMonth: number[];
    months: string[];
    days: string;
    hour: string;
    minute: string;
    second: string;
    phase: string;
    cronString: string;
    preset: SchedulePreset;
    children: Snippet;
  };

  let {
    schedule = null,
    daysOfWeek = $bindable([]),
    daysOfMonth = $bindable([]),
    months = $bindable([]),
    days = $bindable(''),
    hour = $bindable(''),
    minute = $bindable(''),
    second = $bindable(''),
    phase = $bindable(''),
    cronString = $bindable(''),
    preset = $bindable(''),
    children,
  }: Props = $props();

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

  onMount(() => {
    () => clearSchedule();
  });
</script>

<Tabs class="mt-8 w-full">
  <h2 class="mb-4">{translate('schedules.schedule-spec')}</h2>
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
      <TabPanel id="existing-panel" tabId="existing-tab" class="w-full">
        <ScheduleFrequency
          calendar={schedule?.spec?.structuredCalendar?.[0]}
          interval={schedule?.spec?.interval?.[0]}
          timezoneName={schedule?.spec?.timezoneName}
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
        <h3>
          {translate('schedules.cron-view-title')}
        </h3>
        <p>{translate('schedules.cron-view-description')}</p>
        <Input
          label={translate('schedules.cron-view-title')}
          labelHidden
          id="cronString"
          bind:value={cronString}
          placeholder="* * * * *"
        />
      </div>
    </TabPanel>
  </div>
  {@render children?.()}
</Tabs>
