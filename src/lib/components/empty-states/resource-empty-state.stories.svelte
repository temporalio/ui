<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import BatchTable from '$lib/components/batch-operations/table.svelte';
  import SchedulesEmptyState from '$lib/components/schedule/schedules-list/schedules-empty-state.svelte';
  import ActivitiesEmptyState from '$lib/components/standalone-activities/activities-summary-configurable-table/table-empty-state.svelte';
  import NexusEmptyState from '$lib/components/standalone-nexus-operations/nexus-operations-summary-configurable-table/table-empty-state.svelte';
  import WorkersEmptyState from '$lib/components/workers/workers-table/worker-heartbeats-sdk-warning.svelte';
  import WorkflowsEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';

  import ResourceEmptyState from './resource-empty-state.svelte';

  const { Story } = defineMeta({
    title: 'Empty State/Resources',
    component: ResourceEmptyState,
    parameters: {
      layout: 'fullscreen',
      sveltekit_experimental: {
        stores: {
          page: {
            url: new URL('http://localhost/namespaces/default'),
            params: { namespace: 'default' },
            data: {},
          },
        },
      },
    },
  });
</script>

<Story name="Workflows" asChild>
  <WorkflowsEmptyState />
</Story>

<Story name="Standalone Activities" asChild>
  <ActivitiesEmptyState />
</Story>

<Story name="Standalone Nexus Operations" asChild>
  <NexusEmptyState />
</Story>

<Story name="Schedules" asChild>
  <SchedulesEmptyState />
</Story>

<Story name="Workers" asChild>
  <WorkersEmptyState />
</Story>

<Story name="Batch" asChild>
  <BatchTable namespace="default" operations={[]} />
</Story>

<Story name="Schedules Error" asChild>
  <SchedulesEmptyState error="Unable to load schedules." />
</Story>

<Story name="Schedules No Matches" asChild>
  <SchedulesEmptyState query="WorkflowType = &quot;Example&quot;" />
</Story>
