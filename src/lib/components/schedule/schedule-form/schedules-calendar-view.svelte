<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import ScheduleDayOfMonthView from '$lib/components/schedule/schedule-day-of-month-view.svelte';
  import ScheduleDayOfWeekView from '$lib/components/schedule/schedule-day-of-week-view.svelte';
  import ScheduleFrequency from '$lib/components/schedule/schedule-frequency.svelte';
  import SchedulesIntervalView from '$lib/components/schedule/schedules-interval-view.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import TabPanel from '$lib/holocene/tab/tab-panel.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { FullSchedule, SchedulePreset } from '$lib/types/schedule';

  interface Props {
    schedule?: FullSchedule | null;
    daysOfWeek?: string[];
    daysOfMonth?: number[];
    months?: string[];
    days?: string;
    hour?: string;
    minute?: string;
    second?: string;
    phase?: string;
    cronString?: string;
    timezoneName: string;
    preset: SchedulePreset;
    children?: Snippet;
  }

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
    preset = $bindable(),
    timezoneName,
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

  let previousPreset = preset;
  $effect(() => {
    if (preset !== previousPreset) {
      clearSchedule();
      previousPreset = preset;
    }
  });
</script>

<Tabs class="mt-8 w-full">
  <h2 class="mb-4">{translate('schedules.schedule-spec')}</h2>
  <TabList label="Schedule Tabs">
    {#if schedule}
      <Tab
        label="Existing"
        id="existing-tab"
        data-testid="existing-tab"
        panelId="existing-panel"
        onClick={() => (preset = 'existing')}
      />
    {/if}
    <Tab
      label="Interval"
      id="interval-tab"
      data-testid="interval-tab"
      panelId="interval-panel"
      onClick={() => (preset = 'interval')}
    />
    <Tab
      label="Days of the Week"
      id="daily-tab"
      data-testid="daily-tab"
      panelId="daily-panel"
      onClick={() => (preset = 'week')}
    />
    <Tab
      label="Days of the Month"
      id="monthly-tab"
      data-testid="monthly-tab"
      panelId="monthly-panel"
      onClick={() => (preset = 'month')}
    />
    <Tab
      label="String"
      id="string-tab"
      data-testid="string-tab"
      panelId="string-panel"
      onClick={() => (preset = 'string')}
    />
  </TabList>
  <div class="mt-4 flex w-full flex-wrap gap-6">
    {#if schedule}
      <TabPanel id="existing-panel" tabId="existing-tab" class="w-full">
        <ScheduleFrequency
          frequency={[
            ...(schedule?.spec?.structuredCalendar ?? []),
            ...(schedule?.spec?.interval ?? []),
          ]}
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
      <ScheduleDayOfWeekView
        bind:daysOfWeek
        bind:hour
        bind:minute
        {timezoneName}
      />
    </TabPanel>
    <TabPanel id="monthly-panel" tabId="monthly-tab">
      <ScheduleDayOfMonthView
        bind:daysOfMonth
        bind:months
        bind:hour
        bind:minute
        {timezoneName}
      />
    </TabPanel>
    <TabPanel
      id="string-panel"
      tabId="string-tab"
      class="flex w-full flex-col gap-4"
    >
      <div class="flex flex-col gap-2">
        <h3>
          {translate('schedules.cron-view-title')}
        </h3>
        <p class="text-secondary">
          {translate('schedules.crow-view-example-description')}
        </p>
        <CodeBlock
          inline
          language="text"
          content={`┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of the month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *`}
          copyable={false}
        />
      </div>
      <div class="flex flex-col gap-2">
        <p class="text-secondary">
          {translate('schedules.cron-view-description')}
        </p>
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
