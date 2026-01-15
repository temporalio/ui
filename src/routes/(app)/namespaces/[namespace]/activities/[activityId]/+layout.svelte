<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/state';

  import ActivityExecutionLayout from '$lib/layouts/activity-execution-layout.svelte';
  import {
    activityExecution,
    ActivityExecutionPoller,
  } from '$lib/utilities/activity-execution-poller.svelte';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);

  const activityPollerAbortController = new AbortController();
  const poller = $derived(
    new ActivityExecutionPoller(
      namespace,
      activityId,
      activityPollerAbortController,
      (execution) => {
        $activityExecution = execution;
      },
    ),
  );

  onMount(async () => {
    poller.start();
  });

  onDestroy(() => {
    activityPollerAbortController.abort();
  });

  let { children } = $props();
</script>

<ActivityExecutionLayout
  activityExecution={$activityExecution}
  {namespace}
  {activityId}
>
  {@render children()}
</ActivityExecutionLayout>
