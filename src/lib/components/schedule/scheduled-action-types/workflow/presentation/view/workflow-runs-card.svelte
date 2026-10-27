<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabButtonList from '$lib/holocene/tabs-primitive/tab-button-list.svelte';
  import TabPanels from '$lib/holocene/tabs-primitive/tab-panels.svelte';
  import Tabs from '$lib/holocene/tabs-primitive/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import Segment from '$lib/io/segmented-control/segment.svelte';
  import SegmentedControl from '$lib/io/segmented-control/segmented-control.svelte';
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
    <SegmentedControl class="mr-auto">
      <TabButtonList
        aria-label={translate('schedules.workflow-runs')}
        class="contents"
      >
        {#snippet tabButtonSnippet(getTabButtonProps, { isSelected, tab })}
          <Segment {...getTabButtonProps()} selected={isSelected}>
            {tab === 'recent'
              ? translate('schedules.recent-runs-count', {
                  count: recentRunCount,
                })
              : translate('schedules.upcoming-runs-count', {
                  count: upcomingRunCount,
                })}
          </Segment>
        {/snippet}
      </TabButtonList>
    </SegmentedControl>

    <TabPanels>
      {#snippet tabPanelSnippet(getTabPanelProps, { tab })}
        <div {...getTabPanelProps()}>
          {#if tab === 'recent'}
            <WorkflowRunsRecent
              {schedule}
              {namespace}
              {openBackfillConfirmationModal}
              {openTriggerConfirmationModal}
            />
          {:else}
            <WorkflowRunsUpcoming
              {schedule}
              {openBackfillConfirmationModal}
              {openTriggerConfirmationModal}
            />
          {/if}
        </div>
      {/snippet}
    </TabPanels>
  </Tabs>
</Panel>
