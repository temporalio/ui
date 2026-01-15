<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import ActivityExecutionHeader from '$lib/components/activity-execution/activity-execution-header.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import type { ActivityExecution } from '$lib/types/activity-execution';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForStandaloneActivityDetails,
    routeForStandaloneActivityMetadata,
    routeForStandaloneActivitySearchAttributes,
    routeForStandaloneActivityWorkers,
  } from '$lib/utilities/route-for';

  interface Props {
    activityExecution: ActivityExecution;
    namespace: string;
    activityId: string;
    children: Snippet;
  }

  let { activityExecution, children, namespace, activityId }: Props = $props();

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
</script>

{#if activityExecution}
  <div class="flex flex-col gap-4">
    <ActivityExecutionHeader activityExecutionInfo={activityExecution.info} />

    <Tabs>
      <TabList label="Activity Execution Tabs">
        <Tab
          label="Details"
          id="activity-execution-details-tab"
          href={detailsRoute}
          active={pathMatches(page.url.pathname, detailsRoute)}
        />
        <Tab
          label="Workers"
          id="activity-execution-workers-tab"
          href={workersRoute}
          active={pathMatches(page.url.pathname, workersRoute)}
        />
        <Tab
          label="Search Attributes"
          id="activity-execution-search-attributes-tab"
          href={searchAttributesRoute}
          active={pathMatches(page.url.pathname, searchAttributesRoute)}
        />
        <Tab
          label="User Metadata"
          id="activity-execution-metadata-tab"
          href={metadataRoute}
          active={pathMatches(page.url.pathname, metadataRoute)}
        />
      </TabList>
    </Tabs>
    {@render children()}
  </div>
{/if}
