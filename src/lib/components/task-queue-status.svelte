<script lang="ts">
  import TaskQueueAvailability from '$lib/components/workers/task-queue-availability.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import type { Endpoint, TaskQueueResponse } from '$lib/types';

  let { endpoint }: { endpoint: Endpoint } = $props();

  const targetNamespace = $derived(endpoint?.spec?.target?.worker?.namespace);
  const targetTaskQueue = $derived(endpoint?.spec?.target?.worker?.taskQueue);

  let workers = $state<TaskQueueResponse>();

  $effect(() => {
    const namespace = targetNamespace;
    const queue = targetTaskQueue;
    if (!namespace || !queue) return;

    workers = undefined;
    let current = true;
    getPollers({ namespace, queue })
      .then((response) => {
        if (current) workers = response;
      })
      .catch(() => {
        if (current) workers = undefined;
      });

    return () => {
      current = false;
    };
  });
</script>

{#if targetNamespace && targetTaskQueue && workers}
  <TaskQueueAvailability
    namespace={targetNamespace}
    taskQueue={targetTaskQueue}
    {workers}
  />
{/if}
