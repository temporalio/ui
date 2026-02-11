<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import ActivityExecutionHeader from '$lib/components/standalone-activities/activity-header.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getActivityPollers } from '$lib/services/pollers-service';
  import { activitiesSearchParams } from '$lib/stores/activities';
  import type { ActivityExecution } from '$lib/types/activity-execution';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForStandaloneActivities,
    routeForStandaloneActivityDetails,
    routeForStandaloneActivityMetadata,
    routeForStandaloneActivitySearchAttributes,
    routeForStandaloneActivityWorkers,
  } from '$lib/utilities/route-for';
  import type { StandaloneActivityPoller } from '$lib/utilities/standalone-activity-poller.svelte';

  interface Props {
    activityExecution: ActivityExecution;
    namespace: string;
    activityId: string;
    children: Snippet;
    poller: StandaloneActivityPoller;
  }

  let { activityExecution, children, namespace, activityId, poller }: Props =
    $props();

  const routeParameters = $derived({ namespace, activityId });

  const detailsRoute = $derived(
    routeForStandaloneActivityDetails(routeParameters),
  );

  const workersRoute = $derived(
    routeForStandaloneActivityWorkers(routeParameters),
  );

  const searchAttributesRoute = $derived(
    routeForStandaloneActivitySearchAttributes(routeParameters),
  );

  const metadataRoute = $derived(
    routeForStandaloneActivityMetadata(routeParameters),
  );

  const activitiesHref = $derived(
    `${routeForStandaloneActivities({ namespace })}?${$activitiesSearchParams}`,
  );

  // activityExecution.info.taskQueue is intentional here, when the poller resolves, the reference to
  // activityExecution is updated, causing the $derived to re-run and the #await block to re-trigger.
  const getPollersRequest = $derived(
    getActivityPollers({ queue: activityExecution.info.taskQueue, namespace }),
  );
</script>

{#if activityExecution}
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <Link
        href={activitiesHref}
        data-testid="back-to-activities"
        icon="chevron-left"
      >
        {translate('standalone-activities.back-to-activities')}
      </Link>
    </div>
    <ActivityExecutionHeader
      {namespace}
      {poller}
      activityExecutionInfo={activityExecution.info}
    />

    <Tabs>
      <TabList label={translate('standalone-activities.layout-tabs-label')}>
        <Tab
          label={translate('standalone-activities.layout-details-tab')}
          id="activity-execution-details-tab"
          href={detailsRoute}
          active={pathMatches(page.url.pathname, detailsRoute)}
        />
        <Tab
          label={translate('standalone-activities.layout-workers-tab')}
          id="activity-execution-workers-tab"
          href={workersRoute}
          active={pathMatches(page.url.pathname, workersRoute)}
        />
        <Tab
          label={translate(
            'standalone-activities.layout-search-attributes-tab',
          )}
          id="activity-execution-search-attributes-tab"
          href={searchAttributesRoute}
          active={pathMatches(page.url.pathname, searchAttributesRoute)}
        />
        <Tab
          label={translate('standalone-activities.layout-user-metadata-tab')}
          id="activity-execution-metadata-tab"
          href={metadataRoute}
          active={pathMatches(page.url.pathname, metadataRoute)}
        />
      </TabList>
    </Tabs>
    {#await getPollersRequest then response}
      {#if !response.pollers && activityExecution.info.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING'}
        <Alert
          intent="error"
          title={translate('workflows.workflow-error-no-workers-title')}
        >
          {translate('workflows.workflow-error-no-workers-description', {
            taskQueue: activityExecution.info.taskQueue,
          })}
        </Alert>
      {/if}
    {/await}
    {@render children()}
  </div>
{/if}
