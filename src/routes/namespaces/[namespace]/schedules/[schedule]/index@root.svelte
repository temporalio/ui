<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { fetchSchedule } from '$lib/services/schedule-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  const defaultQuery = toListWorkflowQuery({ timeRange: '1 day' });

  export const load: Load = async function ({ params }) {
    const { schedule: scheduleId, namespace } = params;

    // if (!url.searchParams.has('query')) {
    //   url.searchParams.set('query', defaultQuery);
    // }

    const parameters = {
      namespace,
      scheduleId: decodeURIForSvelte(scheduleId),
    };

    const workflow = await fetchSchedule(parameters, fetch);

    return {
      props: { workflow, namespace },
      stuff: { workflow },
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
  export let workflow: WorkflowExecution;

  $: error = 'Error message with helpful resolution';
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
        <span class="font-medium select-all">SchedulemeID4</span>
        <WorkflowStatus status="Running" />
      </h1>
    </div>
    <div class="flex items-center text-sm">
      <p>{namespace} WorkflowTypeName-1</p>
    </div>
    <div class="flex items-center gap-2 text-sm">
      <p>Created: {formatDate('2022-05-03T15:35:36.730883Z', $timeFormat)}</p>
      <p>-</p>
      <p>
        Last updated: {formatDate('2022-05-06T15:35:36.730883Z', $timeFormat)}
      </p>
    </div>
  </main>
</header>

{#if error}
  <div class="w-full xl:w-1/2">
    <ScheduleError {error} />
  </div>
{/if}
<div class="w-full xl:w-1/2">
  <ScheduleFrequency />
</div>
<div class="flex flex-col xl:flex-row gap-4">
  <div class="w-full xl:w-auto">
    <ScheduleRecentRuns />
  </div>
  <div class="w-full xl:w-auto">
    <ScheduleUpcomingRuns />
  </div>
</div>
<div class="w-full xl:w-1/2">
  <ScheduleAdvancedSettings />
</div>
<div class="w-full xl:w-1/2">
  <ScheduleMemo />
</div>
