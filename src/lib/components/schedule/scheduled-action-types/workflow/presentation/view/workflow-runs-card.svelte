<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Segment, segmentedControlRecipe } from '$lib/io/segmented-control';
  import { TabBar, TabPanel, Tabs } from '$lib/io/tabs/primitive';
  import { toUpcomingScheduleRuns } from '$lib/services/schedule-service';
  import { workflowCount } from '$lib/stores/workflows';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import { toRecentWorkflowRuns } from './recent-runs';
  import type { WorkflowSchedule } from '../../types';

  import WorkflowRunsRecent from './workflow-runs-recent.svelte';
  import WorkflowRunsUpcoming from './workflow-runs-upcoming.svelte';

  interface Props {
    namespace: string;
    schedule: WorkflowSchedule;
    scheduleId: string;
    openBackfillConfirmationModal: () => void;
    openTriggerConfirmationModal: () => void;
  }

  const {
    schedule,
    namespace,
    scheduleId,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
  }: Props = $props();

  const workflowQuery = $derived(`TemporalScheduledById="${scheduleId}"`);

  const recentRunCount = $derived(toRecentWorkflowRuns(schedule).length);
  const upcomingRunCount = $derived(toUpcomingScheduleRuns(schedule).length);

  type View = 'recent' | 'upcoming';
  let view: View = $derived(recentRunCount ? 'recent' : 'upcoming');
  function handleViewClick(nextView: View) {
    view = nextView;
  }

  const tabs: View[] = ['recent', 'upcoming'];
</script>

<Panel
  class="flex w-full flex-col gap-4 rounded-lg border-primary p-6"
  as="section"
>
  <header class="mb-1 flex items-center justify-between">
    <h2 class="text-2xl font-medium">{translate('schedules.workflow-runs')}</h2>
    <Link
      href={routeForWorkflowsWithQuery({
        namespace,
        query: workflowQuery,
      }) ?? ''}
    >
      {translate('common.view-all-runs-count', {
        count: $workflowCount.count,
      })}
    </Link>
  </header>

  <Tabs {tabs} selectedTab={view} onSelectedTabChange={handleViewClick}>
    <TabBar
      aria-label={translate('schedules.workflow-runs')}
      class={segmentedControlRecipe({ className: 'mr-auto' })}
    >
      {#snippet tabSnippet({ tab, isSelected, getAttributes })}
        <Segment {...getAttributes()} selected={isSelected}>
          {tab === 'recent'
            ? translate('schedules.recent-runs-count', {
                count: recentRunCount,
              })
            : translate('schedules.upcoming-runs-count', {
                count: upcomingRunCount,
              })}
        </Segment>
      {/snippet}
    </TabBar>

    <TabPanel tab="recent">
      <WorkflowRunsRecent
        {schedule}
        {namespace}
        {openBackfillConfirmationModal}
        {openTriggerConfirmationModal}
      />
    </TabPanel>
    <TabPanel tab="upcoming">
      <WorkflowRunsUpcoming
        {schedule}
        {openBackfillConfirmationModal}
        {openTriggerConfirmationModal}
      />
    </TabPanel>
  </Tabs>
</Panel>
