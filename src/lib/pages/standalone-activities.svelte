<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import SavedQueryViews from '$lib/components/saved-query-views/saved-views.svelte';
  import ActivitiesSummaryConfigurableTable from '$lib/components/standalone-activities/activities-summary-configurable-table.svelte';
  import FilterBar from '$lib/components/standalone-activities/activities-summary-filter-bar/filter-bar.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { fetchActivityCountByStatus } from '$lib/services/activity-counts';
  import {
    activitiesQuery,
    activitiesSearchParams,
    activityCount,
    activityRefresh,
  } from '$lib/stores/activities';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import {
    availableActivityColumns,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { activityFilters } from '$lib/stores/filters';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import {
    DEFAULT_ACTIVITY_SYSTEM_VIEW,
    savedActivityQueries,
    systemActivityViews,
  } from '$lib/stores/saved-queries';
  import { activityExecutionSearchAttributes } from '$lib/stores/search-attributes';
  import { getActivityStatusAndCountOfGroup } from '$lib/utilities/get-activity-status-and-count';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { routeForStartStandaloneActivity } from '$lib/utilities/route-for';
  import { standaloneActivityCommandsDisabled } from '$lib/utilities/standalone-activities-commands-disabled';

  interface Props {
    releaseStageBadge?: Snippet;
  }

  let { releaseStageBadge }: Props = $props();

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const namespace = $derived(page.params.namespace);
  const searchParams = $derived(page.url.searchParams.toString());

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived($timestamp(refreshTime));
  const availableColumns = $derived(availableActivityColumns(namespace));
  const activityStartEnabled = $derived(
    !standaloneActivityCommandsDisabled(page),
  );

  onMount(() => {
    $lastUsedNamespace = page.params.namespace;
    if (query) {
      $activityFilters = toListWorkflowFilters(
        query,
        $activityExecutionSearchAttributes,
      );
    }
  });

  $effect(() => {
    $activitiesQuery = query;
  });

  $effect(() => {
    $activitiesSearchParams = searchParams;
  });

  let customizationDrawerOpen = $state(false);

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };
</script>

<header class="flex flex-col gap-2">
  <div class="flex flex-col justify-between gap-2 md:flex-row">
    <div class="flex flex-row flex-wrap items-start gap-2">
      <div>
        <h1 class="flex items-center gap-2 leading-7">
          {#if $supportsAdvancedVisibility}
            <span
              role="status"
              aria-atomic="true"
              class="flex items-center gap-2"
            >
              <span data-testid="activity-count"
                >{$activityCount.count.toLocaleString()}</span
              >
              <Translate
                key="standalone-activities.activities-plural"
                count={$activityCount.count}
              />
            </span>
          {:else}
            <Translate key="standalone-activities.recent-activities" />
          {/if}
        </h1>
        <p class="mt-2 text-xs text-secondary">
          {refreshTimeFormatted}
        </p>
      </div>
      {@render releaseStageBadge?.()}
      <CountRefreshButton
        count={$activityCount.newCount}
        refresh={activityRefresh}
      />
      <StatusCounts
        bind:refreshTime
        countStore={activityCount}
        refresh={activityRefresh}
        filters={activityFilters}
        fetchCounts={fetchActivityCountByStatus}
        getStatusAndCount={getActivityStatusAndCountOfGroup}
        data-testid="activity-status"
      />
    </div>
    {#if activityStartEnabled}
      <Button href={routeForStartStandaloneActivity({ namespace })}>
        {translate('standalone-activities.start-standalone-activity')}
      </Button>
    {/if}
  </div>
</header>

<FilterBar />
<div class="flex overflow-auto">
  <SavedQueryViews
    filters={activityFilters}
    savedQueries={savedActivityQueries}
    systemViews={systemActivityViews}
    defaultView={DEFAULT_ACTIVITY_SYSTEM_VIEW}
    searchAttributes={activityExecutionSearchAttributes}
    id="activity"
  />
  <div
    class={merge(
      'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
      !$savedQueryNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
    )}
  >
    <ActivitiesSummaryConfigurableTable
      onClickConfigure={openCustomizationDrawer}
    />
  </div>
</div>
<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.ACTIVITIES}
  type={translate('common.columns')}
  title={translate('standalone-activities.activities-table')}
/>
