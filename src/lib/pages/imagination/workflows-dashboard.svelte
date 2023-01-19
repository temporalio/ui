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

  const refreshWorkflows = () => {
    $refresh = Date.now();
  };

  let totals = {
    running: { count: 0, color: '#93c5fd' },
    failed: { count: 0, color: '#fca5a5' },
    timedOut: { count: 0, color: '#fdba74' },
    canceled: { count: 0, color: '#fde047' },
    terminated: { count: 0, color: '#d4d4d8' },
    completed: { count: 0, color: '#86efac' },
  };

  $: namespace = $page.params.namespace;

  const fetchStatusCounts = async () => {
    totals.running.count = await fetchStatusWorkflowCount(
      namespace,
      'Running',
      $workflowFilters,
    );
    totals.failed.count = await fetchStatusWorkflowCount(
      namespace,
      'Failed',
      $workflowFilters,
    );
    totals.timedOut.count = await fetchStatusWorkflowCount(
      namespace,
      'TimedOut',
      $workflowFilters,
    );
    totals.canceled.count = await fetchStatusWorkflowCount(
      namespace,
      'Canceled',
      $workflowFilters,
    );
    totals.terminated.count = await fetchStatusWorkflowCount(
      namespace,
      'Terminated',
      $workflowFilters,
    );
    totals.completed.count = await fetchStatusWorkflowCount(
      namespace,
      'Completed',
      $workflowFilters,
    );
  };

  $: query, $refresh, fetchStatusCounts();

  // For Imagination Pagination

  let activeTotal: number = 0;
  let activeStatus: WorkflowStatus = 'Running';

  const onStatusClick = (status: WorkflowStatus, count: number) => {
    activeStatus = status;
    activeTotal = count;
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
      count={totals.running.count}
      status="Running"
      onClick={onStatusClick}
      active={activeStatus === 'Running'}
    />
    <StatusCard
      count={totals.failed.count}
      status="Failed"
      onClick={onStatusClick}
      active={activeStatus === 'Failed'}
    />
    <StatusCard
      count={totals.timedOut.count}
      status="TimedOut"
      onClick={onStatusClick}
      active={activeStatus === 'TimedOut'}
    />
    <StatusCard
      count={totals.terminated.count}
      status="Terminated"
      onClick={onStatusClick}
      active={activeStatus === 'Terminated'}
    />
    <StatusCard
      count={totals.canceled.count}
      status="Canceled"
      onClick={onStatusClick}
      active={activeStatus === 'Canceled'}
    />
    <StatusCard
      count={totals.completed.count}
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
