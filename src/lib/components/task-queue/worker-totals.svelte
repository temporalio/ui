<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkerInfo } from '$lib/types';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  let { workersInfo }: { workersInfo: WorkerInfo[] } = $props();

  const { active, inactive, workflowTasks, activityTasks } = $derived.by(() => {
    let active = 0;
    let inactive = 0;
    let workflowTasks = 0;
    let activityTasks = 0;
    for (const w of workersInfo) {
      if (toWorkerStatusReadable(w?.workerHeartbeat?.status) === 'Running')
        active++;
      else inactive++;
      workflowTasks +=
        w?.workerHeartbeat?.workflowTaskSlotsInfo?.totalProcessedTasks ?? 0;
      activityTasks +=
        w?.workerHeartbeat?.activityTaskSlotsInfo?.totalProcessedTasks ?? 0;
    }
    return { active, inactive, workflowTasks, activityTasks };
  });

  const totalTasks = $derived(workflowTasks + activityTasks);
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
  <Card>
    <div class="text-sm uppercase tracking-wide text-secondary">
      {translate('workers.active-workers')}
    </div>
    <div class="mt-1 text-3xl font-semibold">{active}</div>
    <div class="mt-1 flex items-center gap-1.5">
      <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
      <span class="text-sm text-success">
        {translate('workflows.running')}
      </span>
    </div>
  </Card>
  <Card>
    <div class="text-sm uppercase tracking-wide text-secondary">
      {translate('workers.inactive-workers')}
    </div>
    <div class="mt-1 text-3xl font-semibold">{inactive}</div>
    <div class="mt-1 flex items-center gap-1.5">
      <span class="text-sm text-secondary">
        {translate('common.inactive')}
      </span>
    </div>
  </Card>

  <Card>
    <div class="text-sm uppercase tracking-wide text-secondary">
      {translate('workers.total-processed-tasks')}
    </div>
    <div class="mt-1 text-3xl font-semibold">{totalTasks}</div>
    <div class="mt-1 text-sm text-secondary">
      {workflowTasks}
      {translate('common.workflows-plural', { count: 1 })} · {activityTasks}
      {translate('common.activities-plural', { count: 1 })}
    </div>
  </Card>
</div>
