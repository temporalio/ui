<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import ActivityExecutionHeader from '$lib/components/standalone-activities/activity-header.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import ErrorComponent from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getActivityPollers } from '$lib/services/pollers-service';
  import { activitiesSearchParams } from '$lib/stores/activities';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForStandaloneActivities,
    routeForStandaloneActivityDetails,
    routeForStandaloneActivityMetadata,
    routeForStandaloneActivitySearchAttributes,
    routeForStandaloneActivityWorkers,
  } from '$lib/utilities/route-for';
  import {
    activityExecution,
    StandaloneActivityPoller,
  } from '$lib/utilities/standalone-activity-poller.svelte';

  interface Props {
    namespace: string;
    activityId: string;
    runId: string;
    children: Snippet;
  }

  let { children, namespace, activityId, runId }: Props = $props();

  let error = $state<Error | undefined>();

  const activityPollerAbortController = new AbortController();
  const poller = $derived(
    new StandaloneActivityPoller(
      namespace,
      activityId,
      runId,
      activityPollerAbortController,
      (execution) => {
        $activityExecution = execution;
      },
      (e) => {
        error = e;
      },
    ),
  );

  const routeParameters = $derived({ namespace, activityId, runId });

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
  const getPollersRequest = $derived.by(() => {
    if (!$activityExecution?.info?.taskQueue) return;

    return getActivityPollers({
      queue: $activityExecution.info.taskQueue,
      namespace,
    });
  });

  onMount(async () => {
    poller.start();
  });

  onDestroy(() => {
    poller.abort();
    $activityExecution = undefined;
  });
</script>

{#if $activityExecution}
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
      activityExecutionInfo={$activityExecution.info}
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
    {#if getPollersRequest}
      {#await getPollersRequest then response}
        {#if !response.pollers && $activityExecution.info.status === 'ACTIVITY_EXECUTION_STATUS_RUNNING'}
          <Alert
            intent="error"
            title={translate('workflows.workflow-error-no-workers-title')}
          >
            {translate('workflows.workflow-error-no-workers-description', {
              taskQueue: $activityExecution.info.taskQueue,
            })}
          </Alert>
        {/if}
      {/await}
    {/if}
    {@render children()}
  </div>
{:else if error}
  <ErrorComponent {error} />
{/if}
