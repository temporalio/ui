<script lang="ts" module>
  import type { Readable, Writable } from 'svelte/store';

  import { twMerge as merge } from 'tailwind-merge';

  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';

  export const ACTIVITY_BATCH_OPERATION_CONTEXT =
    'ACTIVITY_BATCH_OPERATION_CONTEXT';

  export type ActivityBatchOperationContext = {
    allSelected: Writable<boolean>;
    pageSelected: Writable<boolean>;
    terminableActivities: Readable<ActivityExecutionInfo[]>;
    cancelableActivities: Readable<ActivityExecutionInfo[]>;
    selectedActivities: Writable<ActivityExecutionInfo[]>;
    batchActionsVisible: Readable<boolean>;
    openBatchCancelConfirmationModal: () => void;
    openBatchTerminateConfirmationModal: () => void;
    handleSelectAll: (activities: ActivityExecutionInfo[]) => void;
    handleSelectPage: (
      checked: boolean,
      activities: ActivityExecutionInfo[],
    ) => void;
  };
</script>

<script lang="ts">
  import { derived as derivedStore, writable } from 'svelte/store';

  import type { Snippet } from 'svelte';
  import { onMount, setContext } from 'svelte';

  import { page } from '$app/state';

  import ActivitiesSummaryConfigurableTable from '$lib/components/activity/activities-summary-configurable-table.svelte';
  import ActivityCountRefresh from '$lib/components/activity/activity-count-refresh.svelte';
  import ActivityCounts from '$lib/components/activity/activity-counts.svelte';
  import BatchCancelConfirmationModal from '$lib/components/activity/client-actions/batch-cancel-confirmation-modal.svelte';
  import BatchTerminateConfirmationModal from '$lib/components/activity/client-actions/batch-terminate-confirmation-modal.svelte';
  import FilterBar from '$lib/components/activity/filter-bar/index.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import SavedActivityViews from '$lib/pages/saved-activity-views.svelte';
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
  import { savedActivityNavOpen } from '$lib/stores/nav-open';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    isActivityCancelable,
    isActivityTerminable,
  } from '$lib/utilities/get-activity-status-and-count';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  interface Props {
    headerActions?: Snippet;
  }

  let { headerActions }: Props = $props();

  const query = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace);
  const perPage = $derived(page.url.searchParams.get('per-page'));
  const searchParams = $derived(page.url.searchParams.toString());

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived(
    formatDate(refreshTime, $timeFormat, {
      relative: $relativeTime,
      format: $timestampFormat,
    }),
  );

  const availableColumns = $derived(availableActivityColumns(namespace));

  onMount(() => {
    $lastUsedNamespace = page.params.namespace;
    if (query) {
      $activityFilters = toListWorkflowFilters(query, $searchAttributes);
    }
  });

  $effect(() => {
    $activitiesQuery = query;
  });

  $effect(() => {
    $activitiesSearchParams = searchParams;
  });

  $effect(() => {
    namespace;
    query;
    perPage;
    $activityRefresh;
    resetSelection();
  });

  const resetSelection = () => {
    $allSelected = false;
    $pageSelected = false;
    $selectedActivities = [];
  };

  let customizationDrawerOpen = $state(false);

  let batchTerminateConfirmationModalOpen = $state(false);
  let batchCancelConfirmationModalOpen = $state(false);

  const allSelected = writable<boolean>(false);
  const pageSelected = writable<boolean>(false);
  const selectedActivities = writable<ActivityExecutionInfo[]>([]);
  const batchActionsVisible = derivedStore(
    selectedActivities,
    (activities) => activities.length > 0,
  );

  const terminableActivities = derivedStore(selectedActivities, (activities) =>
    activities.filter((activity) => isActivityTerminable(activity.status)),
  );

  const cancelableActivities = derivedStore(selectedActivities, (activities) =>
    activities.filter((activity) => isActivityCancelable(activity.status)),
  );

  const openBatchCancelConfirmationModal = () => {
    batchCancelConfirmationModalOpen = true;
  };

  const openBatchTerminateConfirmationModal = () => {
    batchTerminateConfirmationModalOpen = true;
  };

  const handleSelectAll = (activities: ActivityExecutionInfo[]) => {
    allSelected.set(true);
    selectedActivities.set([...activities]);
  };

  const handleSelectPage = (
    checked: boolean,
    activities: ActivityExecutionInfo[],
  ) => {
    pageSelected.set(checked);
    if (allSelected) allSelected.set(false);
    if (checked) {
      selectedActivities.set([...activities]);
    } else {
      selectedActivities.set([]);
    }
  };

  setContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT, {
    allSelected,
    pageSelected,
    terminableActivities,
    cancelableActivities,
    selectedActivities,
    batchActionsVisible,
    openBatchCancelConfirmationModal,
    openBatchTerminateConfirmationModal,
    handleSelectAll,
    handleSelectPage,
  });

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };
</script>

<BatchTerminateConfirmationModal
  {namespace}
  bind:open={batchTerminateConfirmationModalOpen}
/>

<BatchCancelConfirmationModal
  {namespace}
  bind:open={batchCancelConfirmationModalOpen}
/>

<header class="flex flex-col gap-2">
  <div class="flex flex-col justify-between gap-2 md:flex-row">
    <div class="flex flex-row flex-wrap items-start gap-2">
      <div>
        <h1
          class="flex items-center gap-2 leading-7"
          data-cy="activities-title"
        >
          {#if $supportsAdvancedVisibility}
            <span data-testid="activity-count"
              >{$activityCount.count.toLocaleString()}</span
            >
            <Translate
              key="activities.activities-plural"
              count={$activityCount.count}
            />
          {:else}
            <Translate key="activities.recent-activities" />
          {/if}
        </h1>
        <p class="text-xs text-secondary">
          {refreshTimeFormatted}
        </p>
      </div>
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

<FilterBar />
<div class="flex overflow-auto">
  <SavedActivityViews />
  <div
    class={merge(
      'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
      !$savedActivityNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
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
  title={translate('activities.activities-table')}
/>
