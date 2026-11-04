<script lang="ts">
  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import { translate } from '$lib/i18n/translate';
  import { refreshCurrentScheduleFetch } from '$lib/stores/schedules';
  import {
    workflowCount,
    refresh as workflowRefresh,
  } from '$lib/stores/workflows';

  type Props = {
    namespace: string;
    scheduleId: string;
  };

  let { namespace, scheduleId }: Props = $props();

  const workflowQuery = $derived(`TemporalScheduledById="${scheduleId}"`);
</script>

<dl class="-mt-2 flex flex-col gap-1">
  <dt class="text-secondary">
    {translate('schedules.total-workflows')}
  </dt>
  <dd class="flex flex-wrap items-center gap-2">
    <span class="font-mono" data-testid="workflow-count">
      {$workflowCount.count.toLocaleString()}
    </span>
    <CountRefreshButton
      refresh={workflowRefresh}
      count={$workflowCount.newCount}
      onRefresh={() => {
        refreshCurrentScheduleFetch({ namespace, scheduleId });
      }}
    />
    <StatusCounts class="p-0" staticQuery={workflowQuery} />
  </dd>
</dl>
