<script lang="ts">
  import { page } from '$app/stores';
  
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { loading, updating, workflowsQuery } from '$lib/stores/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';

  export let attribute: string;
  export let value: string;
  export let onTypeClick: (type: string) => void;

  let totalCount = 0;
  let statusGroups = [];

  const colors = {
    Running: '#93c5fd',
    TimedOut: '#ffedd5',
    Completed: '#86efac',
    Failed: '#fca5a5',
    ContinuedAsNew: '#e4e4e7',
    Canceled: '#fde047',
    Terminated: '#fee2e2',
  };

  const fetchCounts = async () => {
    const groupByClause = `${attribute} = "${value}" GROUP BY ExecutionStatus`;
    const countRoute = routeForApi('workflows.count', {
      namespace: $page.params.namespace,
    });

    const { count, groups } = await requestFromAPI<{
      count: string;
      groups: unknown[];
    }>(countRoute, {
      params: { query: `${groupByClause}` },
      notifyOnError: false,
    });
    totalCount = parseInt(count);
    statusGroups = groups.map((group) => {
      const value = decodePayload(group?.groupValues[0]);
      return {
        value,
        count: parseInt(group.count),
        percent: Math.round((parseInt(group.count) / totalCount) * 100),
      };
    });
    console.log('statusGroups; ', statusGroups);
  };

  $: $workflowsQuery, fetchCounts();
  $: runningPercent =
    statusGroups.find((s) => s.value === 'Running')?.percent || 0;
  $: canceledPercent =
    statusGroups.find((s) => s.value === 'Canceled')?.percent || 0;
  $: failedPercent =
    statusGroups.find((s) => s.value === 'Failed')?.percent || 0;
  $: completedPercent =
    statusGroups.find((s) => s.value === 'Completed')?.percent || 0;

  $: colorString = `${colors.Running} ${runningPercent}%, ${colors.Canceled} ${runningPercent}% ${canceledPercent}%, ${colors.Failed} ${canceledPercent}% ${failedPercent}%, ${colors.Completed} ${failedPercent}% ${completedPercent}%`;
</script>

<button
  class="count-card min-w-fit flex flex-row items-center gap-2 cursor-pointer py-1 px-1 lg:py-3 lg:px-3 border-2 border-gray-900 rounded-lg bg-white"
  on:click={() => onTypeClick(value)}
>
  <p class="text-sm">{value}</p>
  {#if $loading || $updating}
    <Spinner class="w-6 h-6 animate-spin" />
  {:else}
    <p class="font-mono text-sm">{totalCount.toLocaleString()}</p>
    <div class="pie" style="background-image: conic-gradient({colorString});" />
  {/if}
</button>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  .count-card:hover {
    background: linear-gradient(157deg, #e6fffa 0%, #e0eaff 100%);
    box-shadow: 4px 4px 0 0 #000;
  }

  .pie {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
</style>
