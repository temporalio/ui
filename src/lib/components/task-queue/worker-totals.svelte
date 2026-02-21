<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import type { WorkerInfo } from '$lib/types';
  import { toWorkerStatusReadable } from '$lib/utilities/screaming-enums';

  let { workersInfo }: { workersInfo: WorkerInfo[] } = $props();

  const totalActive = $derived(
    workersInfo.reduce(
      (acc, worker) =>
        acc +
        (toWorkerStatusReadable(worker?.workerHeartbeat?.status) === 'Running'
          ? 1
          : 0),
      0,
    ),
  );
  const totalInactive = $derived(
    workersInfo.reduce(
      (acc, worker) =>
        acc +
        (toWorkerStatusReadable(worker?.workerHeartbeat?.status) !== 'Running'
          ? 1
          : 0),
      0,
    ),
  );

  const workflowProcessedTasks = $derived(
    workersInfo.reduce(
      (acc, worker) =>
        acc +
        (worker?.workerHeartbeat?.workflowTaskSlotsInfo?.totalProcessedTasks ??
          0),
      0,
    ),
  );

  const activityProcessedTasks = $derived(
    workersInfo.reduce(
      (acc, worker) =>
        acc +
        (worker?.workerHeartbeat?.activityTaskSlotsInfo?.totalProcessedTasks ??
          0),
      0,
    ),
  );

  const totalProcessedTasks = $derived(
    workflowProcessedTasks + activityProcessedTasks,
  );
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
  <Card>
    <div class="text-sm uppercase tracking-wide text-secondary">
      Active Workers
    </div>
    <div class="mt-1 text-3xl font-semibold">{totalActive}</div>
    <div class="mt-1 flex items-center gap-1.5">
      <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
      <span class="text-sm text-success"> Running </span>
    </div>
  </Card>
  <Card>
    <div class="text-sm uppercase tracking-wide text-secondary">
      Inactive Workers
    </div>
    <div class="mt-1 text-3xl font-semibold">{totalInactive}</div>
    <div class="mt-1 flex items-center gap-1.5">
      <span class="text-sm text-secondary"> Inactive </span>
    </div>
  </Card>

  <Card>
    <div class="text-sm uppercase tracking-wide text-secondary">
      Total Processed Tasks
    </div>
    <div class="mt-1 text-3xl font-semibold">{totalProcessedTasks}</div>
    <div class="mt-1 text-sm text-secondary">
      {workflowProcessedTasks} workflow · {activityProcessedTasks} activity
    </div>
  </Card>
</div>
