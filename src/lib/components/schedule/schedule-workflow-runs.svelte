<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PillContainer from '$lib/holocene/pill-container/pill-container.svelte';
  import Pill from '$lib/holocene/pill-container/pill.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import ScheduleRecentRuns from './schedule-recent-runs.svelte';
  import ScheduleUpcomingRuns from './schedule-upcoming-runs.svelte';

  import type { DescribeScheduleResponse } from '$types';

  type Props = {
    namespace: string;
    schedule: DescribeScheduleResponse;
    workflowQuery: string;
    triggerConfirmation: () => void;
    backfillConfirmation: () => void;
  };

  let {
    namespace,
    schedule,
    workflowQuery,
    triggerConfirmation,
    backfillConfirmation,
  }: Props = $props();

  const recentRuns = $derived(schedule?.info?.recentActions);

  let view: 'recent' | 'upcoming' = $derived(
    recentRuns?.length ? 'recent' : 'upcoming',
  );

  const href = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: workflowQuery,
    }),
  );

  const onClick = (id: 'recent' | 'upcoming') => {
    view = id;
  };
</script>

<Panel class="w-full">
  <div class="flex justify-between">
    <h2 class="mb-4">{translate('schedules.workflow-runs')}</h2>
    <Link {href} icon="filter">
      {translate('common.view-all-runs')}
    </Link>
  </div>
  <PillContainer>
    <Pill
      active={view === 'recent'}
      onClick={() => onClick('recent')}
      id="recent">Recent Runs</Pill
    >
    <Pill
      active={view === 'upcoming'}
      onClick={() => onClick('upcoming')}
      id="upcoming">Upcoming Runs</Pill
    >
  </PillContainer>
  {#if view === 'recent'}
    <ScheduleRecentRuns
      {namespace}
      {schedule}
      {triggerConfirmation}
      {backfillConfirmation}
    />
  {:else}
    <ScheduleUpcomingRuns
      {schedule}
      {triggerConfirmation}
      {backfillConfirmation}
    />
  {/if}
</Panel>
