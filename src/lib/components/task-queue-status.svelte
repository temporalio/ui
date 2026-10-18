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
    workers = undefined;
    if (!namespace || !queue) return;

    const controller = new AbortController();
    getPollers({ namespace, queue }, fetch, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) workers = response;
      })
      .catch(() => {
        // requestFromAPI has already shown an error toast.
      });

    return () => controller.abort();
  });
</script>

{#if targetNamespace && targetTaskQueue && workers}
  <TaskQueueAvailability
    namespace={targetNamespace}
    taskQueue={targetTaskQueue}
    {workers}
  />
{/if}
