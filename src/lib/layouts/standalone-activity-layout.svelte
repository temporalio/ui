<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import ActivityDetailsLoading from '$lib/components/standalone-activities/activity-details-loading.svelte';
  import ActivityHeaderLoading from '$lib/components/standalone-activities/activity-header-loading.svelte';
  import ActivityExecutionHeader from '$lib/components/standalone-activities/activity-header.svelte';
  import NoWorkersPollingAlert from '$lib/components/workers/no-workers-polling-alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import ErrorComponent from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';
  import { getActivityPollers } from '$lib/services/pollers-service';
  import { fetchWorkerCount } from '$lib/services/worker-service';
  import {
    activitiesSearchParams,
    activityWorkerCount,
  } from '$lib/stores/activities';
  import { workerCountEnabled } from '$lib/stores/workers';
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
  let loading = $state(true);

  const activityPollerAbortController = new AbortController();
  const poller = $derived(
    new StandaloneActivityPoller(
      namespace,
      activityId,
      runId,
      activityPollerAbortController,
      (execution) => {
        $activityExecution = execution;
        loading = false;
      },
      (e) => {
        error = e;
        loading = false;
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

  const workerHeartbeatsEnabled = $derived(
    !!page.data?.namespace?.namespaceInfo?.capabilities?.workerHeartbeats,
  );
  const workerCountEnabledForNamespace = $derived(
    workerHeartbeatsEnabled && $workerCountEnabled,
  );
  const onWorkersRoute = $derived(pathMatches(page.url.pathname, workersRoute));
  const taskQueue = $derived($activityExecution?.info?.taskQueue);

  $effect(() => {
    if (!workerCountEnabledForNamespace || !taskQueue) {
      $activityWorkerCount = undefined;
      return;
    }

    if (onWorkersRoute) return;

    const controller = new AbortController();
    fetchWorkerCount(
      { namespace, query: `TaskQueue="${taskQueue}"` },
      (input, init) => fetch(input, { ...init, signal: controller.signal }),
    ).then(({ count }) => {
      if (!controller.signal.aborted && count !== undefined)
        $activityWorkerCount = count;
    });

    return () => controller.abort();
  });

  onMount(async () => {
    poller.start();
  });

  onDestroy(() => {
    poller.abort();
    $activityExecution = undefined;
    $activityWorkerCount = undefined;
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-2">
    <Link
      href={activitiesHref}
      data-testid="back-to-activities"
      LeadingIcon={IconChevronLeft}
    >
      {translate('standalone-activities.back-to-activities')}
    </Link>
  </div>

  {#if $activityExecution}
    <ActivityExecutionHeader
      {namespace}
      {poller}
      activityExecutionInfo={$activityExecution.info}
    />
  {:else if loading}
    <ActivityHeaderLoading />
  {/if}

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
      >
        {#if $activityWorkerCount !== undefined}
          <Badge type="primary" class="px-2 py-0">
            {$activityWorkerCount}
          </Badge>
        {/if}
      </Tab>
      <Tab
        label={translate('standalone-activities.layout-search-attributes-tab')}
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

  {#if $activityExecution}
    {#if getPollersRequest}
      {#await getPollersRequest then response}
        <NoWorkersPollingAlert
          {namespace}
          taskQueue={$activityExecution.info.taskQueue ?? ''}
          runningWithNoWorkers={!response.pollers &&
            $activityExecution.info.status ===
              'ACTIVITY_EXECUTION_STATUS_RUNNING'}
        />
      {/await}
    {/if}
    {@render children()}
  {:else if loading}
    <ActivityDetailsLoading />
  {:else if error}
    <ErrorComponent {error} />
  {/if}
</div>
