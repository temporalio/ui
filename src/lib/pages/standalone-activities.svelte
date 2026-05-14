<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import ActivitiesSummaryConfigurableTable from '$lib/components/standalone-activities/activities-summary-configurable-table.svelte';
  import FilterBar from '$lib/components/standalone-activities/activities-summary-filter-bar/filter-bar.svelte';
  import ActivityCountRefresh from '$lib/components/standalone-activities/activity-count-refresh.svelte';
  import ActivityCounts from '$lib/components/standalone-activities/activity-counts.svelte';
  import ActivityStartSummary from '$lib/components/standalone-activities/activity-start-summary.svelte';
  import SavedActivityViews from '$lib/components/standalone-activities/saved-views.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
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
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    activityExecutionSearchAttributes,
    activitySearchAttributes,
  } from '$lib/stores/search-attributes';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    combineFilters,
    createFilter,
    toListWorkflowFilters,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  interface Props {
    headerActions?: Snippet;
    releaseStageBadge?: Snippet;
  }

  let { headerActions, releaseStageBadge }: Props = $props();

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const namespace = $derived(page.params.namespace);
  const searchParams = $derived(page.url.searchParams.toString());

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived($timestamp(refreshTime));
  const availableColumns = $derived(availableActivityColumns(namespace));

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

  let activityStartSummaryKey = $state('');
  let activityStartSummaryItems = $state<ActivityExecutionInfo[]>([]);
  let activityStartSummaryVisibleItems = $state<ActivityExecutionInfo[]>([]);
  let activityStartSummaryLoading = $state(true);

  const addActivityStartSummaryItems = (
    activities: ActivityExecutionInfo[],
  ) => {
    activityStartSummaryVisibleItems = activities;
    if (activityStartSummaryLoading) return;
    if (!activities.length) return;

    const existingActivityKeys = new Set(
      activityStartSummaryItems.map(
        (activity) => `${activity.activityId}:${activity.runId}`,
      ),
    );
    const newActivities = activities.filter(
      (activity) =>
        !existingActivityKeys.has(`${activity.activityId}:${activity.runId}`),
    );

    if (newActivities.length) {
      activityStartSummaryItems = [
        ...activityStartSummaryItems,
        ...newActivities,
      ];
    }
  };

  const setActivityStartSummaryLoading = (loading: boolean) => {
    if (loading) {
      activityStartSummaryLoading = true;
      activityStartSummaryVisibleItems = [];
      return;
    }

    if (activityStartSummaryLoading) {
      activityStartSummaryItems = [...activityStartSummaryVisibleItems];
    }

    activityStartSummaryLoading = false;
  };

  $effect(() => {
    const nextActivityStartSummaryKey = `${namespace ?? ''}|${query ?? ''}|${$activityRefresh}`;
    if (activityStartSummaryKey !== nextActivityStartSummaryKey) {
      activityStartSummaryKey = nextActivityStartSummaryKey;
      activityStartSummaryVisibleItems = [];
      activityStartSummaryLoading = true;
    }
  });

  const isValidFilter = (filter: SearchAttributeFilter): boolean => {
    return Boolean(
      filter.attribute &&
      (filter.value ||
        filter.conditional?.toLocaleLowerCase().includes('null')),
    );
  };

  const activityStartSummaryUsesCurrentTimeEnd = $derived(
    toListWorkflowFilters(query, $activitySearchAttributes).some(
      (filter) =>
        filter.type === SEARCH_ATTRIBUTE_TYPE.DATETIME && isValidFilter(filter),
    ),
  );

  const filterByActivityType = (activityType: string) => {
    const baseFilters = toListWorkflowFilters(
      query,
      $activitySearchAttributes,
    ).filter(
      (filter) => filter.attribute !== 'ActivityType' && isValidFilter(filter),
    );
    const activityTypeFilter = createFilter({
      attribute: 'ActivityType',
      type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      value: activityType,
      conditional: '=',
    });
    const nextFilters = combineFilters([...baseFilters, activityTypeFilter]);
    const nextQuery = toListWorkflowQueryFromFilters(nextFilters);

    $activityFilters = nextFilters;
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: nextQuery,
      clearParameters: [currentPageKey],
    });
  };
</script>

<header class="flex flex-col gap-2">
  <div class="flex flex-col justify-between gap-2 md:flex-row">
    <div class="flex flex-row flex-wrap items-start gap-2">
      <div>
        <h1 class="flex items-center gap-2 leading-7">
          {#if $supportsAdvancedVisibility}
            <span data-testid="activity-count"
              >{$activityCount.count.toLocaleString()}</span
            >
            <Translate
              key="standalone-activities.activities-plural"
              count={$activityCount.count}
            />
          {:else}
            <Translate key="standalone-activities.recent-activities" />
          {/if}
        </h1>
        <p class="text-xs text-secondary">
          {refreshTimeFormatted}
        </p>
      </div>
      {@render releaseStageBadge?.()}
      <ActivityCountRefresh count={$activityCount.newCount} />
      <ActivityCounts bind:refreshTime />
    </div>
    {#if headerActions}
      <div class="flex items-center gap-4">
        {@render headerActions()}
      </div>
    {/if}
  </div>
</header>

<ActivityStartSummary
  loading={activityStartSummaryLoading}
  activities={activityStartSummaryItems}
  useCurrentTimeEnd={activityStartSummaryUsesCurrentTimeEnd}
  onFilter={filterByActivityType}
/>
<div class="flex overflow-auto">
  <SavedActivityViews />
  <div
    class={merge(
      'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
      !$savedQueryNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
    )}
  >
    <ActivitiesSummaryConfigurableTable
      onClickConfigure={openCustomizationDrawer}
      onItemsChange={addActivityStartSummaryItems}
      onLoadingChange={setActivityStartSummaryLoading}
    >
      {#snippet beforeTable()}
        <FilterBar />
      {/snippet}
    </ActivitiesSummaryConfigurableTable>
  </div>
</div>
<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.ACTIVITIES}
  type={translate('common.columns')}
  title={translate('standalone-activities.activities-table')}
/>
