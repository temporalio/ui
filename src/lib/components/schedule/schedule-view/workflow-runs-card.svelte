<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PillContainer from '$lib/holocene/pill-container/pill-container.svelte';
  import Pill from '$lib/holocene/pill-container/pill.svelte';
  import TabButtonList from '$lib/holocene/tabs-primitive/tab-button-list.svelte';
  import TabPanels from '$lib/holocene/tabs-primitive/tab-panels.svelte';
  import Tabs from '$lib/holocene/tabs-primitive/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import { routeForWorkflowsWithQuery } from '$lib/utilities/route-for';

  import WorkflowRunsRecent from './workflow-runs-recent.svelte';
  import WorkflowRunsUpcoming from './workflow-runs-upcoming.svelte';

  interface Props {
    namespace: string;
    schedule: DescribeFullSchedule;
    workflowQuery: string;
    openBackfillConfirmationModal: () => void;
    openTriggerConfirmationModal: () => void;
  }

  const {
    schedule,
    namespace,
    workflowQuery,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
  }: Props = $props();

  const id = $props.id();

  const recentRuns = $derived(schedule?.info?.recentActions);

  type View = 'recent' | 'upcoming';
  let view: View = $derived(recentRuns?.length ? 'recent' : 'upcoming');
  function handleViewClick(nextView: View) {
    view = nextView;
  }

  const tabs: View[] = ['recent', 'upcoming'];
</script>

<Panel class="flex w-full flex-col gap-4 border-subtle p-6" as="section">
  <header class="mb-1 flex items-center justify-between">
    <h2 class="text-2xl font-medium">{translate('schedules.workflow-runs')}</h2>
    <Link
      href={routeForWorkflowsWithQuery({
        namespace,
        query: workflowQuery,
      }) ?? ''}
    >
      {translate('common.view-all-runs')}
    </Link>
  </header>

  <Tabs {tabs} selectedTab={view} onSelectedTabChange={handleViewClick}>
    <PillContainer class="mr-auto flex flex-row rounded-full p-1">
      <TabButtonList
        aria-label={translate('schedules.workflow-runs')}
        class="contents"
      >
        {#snippet tabButtonSnippet(getTabButtonProps, { isSelected, tab })}
          <Pill
            {...getTabButtonProps()}
            active={isSelected}
            id={`${id}-${tab}`}
          >
            {translate(
              tab === 'recent'
                ? 'schedules.recent-runs'
                : 'schedules.upcoming-runs',
            )}
          </Pill>
        {/snippet}
      </TabButtonList>
    </PillContainer>

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
