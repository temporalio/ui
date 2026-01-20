<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/state';

  import ErrorComponent from '$lib/holocene/error.svelte';
  import ActivityExecutionLayout from '$lib/layouts/activity-execution-layout.svelte';
  import {
    activityExecution,
    ActivityExecutionPoller,
  } from '$lib/utilities/activity-execution-poller.svelte';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);
  let error = $state<Error | undefined>();

  const activityPollerAbortController = new AbortController();
  const poller = $derived(
    new ActivityExecutionPoller(
      namespace,
      activityId,
      activityPollerAbortController,
      (execution) => {
        $activityExecution = execution;
      },
      (e) => {
        error = e;
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

{#if error}
  <ErrorComponent {error} />
{:else}
  <ActivityExecutionLayout
    activityExecution={$activityExecution}
    {namespace}
    {activityId}
  >
    {@render children()}
  </ActivityExecutionLayout>
{/if}
