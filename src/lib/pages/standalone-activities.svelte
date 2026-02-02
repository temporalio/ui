<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import ActivitiesSummaryConfigurableTable from '$lib/components/standalone-activities/activities-summary-configurable-table.svelte';
  import FilterBar from '$lib/components/standalone-activities/activities-summary-filter-bar/filter-bar.svelte';
  import ActivityCountRefresh from '$lib/components/standalone-activities/activity-count-refresh.svelte';
  import ActivityCounts from '$lib/components/standalone-activities/activity-counts.svelte';
  import SavedActivityViews from '$lib/components/standalone-activities/saved-views.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import {
    activitiesQuery,
    activitiesSearchParams,
    activityCount,
  } from '$lib/stores/activities';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import {
    availableActivityColumns,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { activityFilters } from '$lib/stores/filters';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import { activityExecutionSearchAttributes } from '$lib/stores/search-attributes';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  interface Props {
    headerActions?: Snippet;
  }

  let { headerActions }: Props = $props();

  const query = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace);
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
