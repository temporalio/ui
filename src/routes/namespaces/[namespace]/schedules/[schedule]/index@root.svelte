<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { fetchSchedule } from '$lib/services/schedule-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  export const load: Load = async function ({ params }) {
    const { schedule: scheduleId, namespace } = params;

    const parameters = {
      namespace,
      scheduleId: decodeURIForSvelte(scheduleId),
    };

    const schedule = await fetchSchedule(parameters, fetch);

    return {
      props: { schedule, namespace, scheduleId },
      stuff: { schedule },
    };
  };
</script>

<script lang="ts">
  import Icon from 'svelte-fa';
  import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
  import { routeForSchedules } from '$lib/utilities/route-for';

  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  import ScheduleFrequency from '$lib/components/schedule/schedule-frequency.svelte';
  import ScheduleMemo from '$lib/components/schedule/schedule-memo.svelte';
  import ScheduleRecentRuns from '$lib/components/schedule/schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from '$lib/components/schedule/schedule-upcoming-runs.svelte';
  import ScheduleAdvancedSettings from '$lib/components/schedule/schedule-advanced-settings.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import ScheduleError from '$lib/components/schedule/schedule-error.svelte';

  export let namespace: string;
  export let scheduleId: string;
  export let schedule: DescribeScheduleResponse;

  console.log('SCHEDULE: ', schedule);
  $: error = schedule.info.invalidScheduleError;
</script>

<header class="flex flex-col gap-4 mb-8">
  <main class="flex flex-col gap-1 relative">
    <a
      href={routeForSchedules({ namespace })}
      class="absolute top-2 back-to-workflows"
      style="left: -1.5rem"
    >
      <Icon icon={faChevronLeft} />
    </a>
    <div class="flex justify-between items-center">
      <h1 class="text-2xl flex relative items-center gap-4">
        <span class="font-medium select-all">{scheduleId}</span>
        <WorkflowStatus status="Running" />
      </h1>
    </div>
    <div class="flex items-center text-sm">
      <p>
        {namespace}
        {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
      </p>
    </div>
    <div class="flex items-center gap-2 text-sm">
      <p>Created: {formatDate(schedule?.info?.createTime, $timeFormat)}</p>
      {#if schedule.info.updateTime}
        <p>-</p>
        <p>
          Last updated: {formatDate(schedule?.info?.updateTime, $timeFormat)}
        </p>
      {/if}
    </div>
  </main>
</header>
<div class="flex flex-col gap-4 pb-24">
  {#if error}
    <div class="w-full xl:w-1/2">
      <ScheduleError {error} />
    </div>
  {/if}
  <div class="w-full xl:w-1/2">
    <ScheduleFrequency
      calendar={schedule?.schedule?.spec?.calendar?.[0]}
      interval={schedule?.schedule?.spec?.interval?.[0]}
    />
  </div>
  <div class="flex flex-col xl:flex-row gap-4">
    <div class="w-full xl:w-3/4">
      <ScheduleRecentRuns
        {namespace}
        recentRuns={schedule?.info?.recentActions?.reverse()}
      />
    </div>
    <div class="w-full xl:w-1/4">
      <ScheduleUpcomingRuns futureRuns={schedule?.info?.futureActionTimes} />
    </div>
  </div>
  <div class="w-full xl:w-1/2">
    <ScheduleAdvancedSettings
      spec={schedule?.schedule?.spec}
      state={schedule?.schedule?.state}
      policies={schedule?.schedule?.policies}
    />
  </div>
  <div class="w-full xl:w-1/2">
    <ScheduleMemo notes={schedule?.schedule?.state?.notes} />
  </div>
</div>
