<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { refresh, workflowsQuery } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';

  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  import { fetchStatusWorkflowCount } from '$lib/services/workflow-service';
  import Card from '$lib/holocene/card.svelte';
  import WorkflowsImagination from './workflows-imagination.svelte';
  import StatusCard from './_status-card.svelte';
  import PieChart from './_pie-chart.svelte';
  import TimePicker from './_time-picker.svelte';

  $: query = $page.url.searchParams.get('query');

  $: {
    // For returning to page from 'Back to Workflows' with previous search
    if (query) {
      $workflowsQuery = query;
    }
  }

  $: {
    if (!$workflowFilters.length && !$workflowSorts.length) {
      $workflowsQuery = '';
    }
  }

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    if (query) {
      // Set filters from inital page load query if it exists
      $workflowFilters = toListWorkflowFilters(query);
    } else {
      $workflowFilters = [];
    }
  });

  let totals = {
    Running: { count: 0, color: '#93c5fd' },
    Failed: { count: 0, color: '#fca5a5' },
    TimedOut: { count: 0, color: '#fdba74' },
    Canceled: { count: 0, color: '#fde047' },
    Terminated: { count: 0, color: '#d4d4d8' },
    Completed: { count: 0, color: '#86efac' },
  };

  $: namespace = $page.params.namespace;

  const fetchStatusCounts = async () => {
    totals.Running.count = await fetchStatusWorkflowCount(
      namespace,
      'Running',
      $workflowFilters,
    );
    totals.Failed.count = await fetchStatusWorkflowCount(
      namespace,
      'Failed',
      $workflowFilters,
    );
    totals.TimedOut.count = await fetchStatusWorkflowCount(
      namespace,
      'TimedOut',
      $workflowFilters,
    );
    totals.Canceled.count = await fetchStatusWorkflowCount(
      namespace,
      'Canceled',
      $workflowFilters,
    );
    totals.Terminated.count = await fetchStatusWorkflowCount(
      namespace,
      'Terminated',
      $workflowFilters,
    );
    totals.Completed.count = await fetchStatusWorkflowCount(
      namespace,
      'Completed',
      $workflowFilters,
    );
    activeTotal = totals.Running.count;
  };

  $: query, $refresh, fetchStatusCounts();

  // For Imagination Pagination

  let activeTotal: number = 0;
  let activeStatus: WorkflowStatus = 'Running';

  const onStatusClick = async (status: WorkflowStatus) => {
    activeStatus = status;
    totals[status].count = await fetchStatusWorkflowCount(
      namespace,
      status,
      $workflowFilters,
    );
    activeTotal = totals[status].count;
  };
</script>

<section>
  <slot />
  <div class="flex flex-row items-stretch gap-4">
    <Card class="bg-gray-700">
      {#key totals}
        <PieChart {totals} />
      {/key}
    </Card>
    <StatusCard
      count={totals.Running.count}
      status="Running"
      onClick={onStatusClick}
      active={activeStatus === 'Running'}
    />
    <StatusCard
      count={totals.Failed.count}
      status="Failed"
      onClick={onStatusClick}
      active={activeStatus === 'Failed'}
    />
    <StatusCard
      count={totals.TimedOut.count}
      status="TimedOut"
      onClick={onStatusClick}
      active={activeStatus === 'TimedOut'}
    />
    <StatusCard
      count={totals.Terminated.count}
      status="Terminated"
      onClick={onStatusClick}
      active={activeStatus === 'Terminated'}
    />
    <StatusCard
      count={totals.Canceled.count}
      status="Canceled"
      onClick={onStatusClick}
      active={activeStatus === 'Canceled'}
    />
    <StatusCard
      count={totals.Completed.count}
      status="Completed"
      onClick={onStatusClick}
      active={activeStatus === 'Completed'}
    />
    <Card class="w-auto text-center">
      <h3>In the Last</h3>
      <TimePicker />
    </Card>
  </div>
  <WorkflowsImagination {activeTotal} {activeStatus} />
</section>
