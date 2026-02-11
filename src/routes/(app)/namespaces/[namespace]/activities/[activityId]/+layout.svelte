<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/state';

  import ErrorComponent from '$lib/holocene/error.svelte';
  import StandaloneActivityLayout from '$lib/layouts/standalone-activity-layout.svelte';
  import {
    activityExecution,
    StandaloneActivityPoller,
  } from '$lib/utilities/standalone-activity-poller.svelte';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);
  let error = $state<Error | undefined>();

  const activityPollerAbortController = new AbortController();
  const poller = $derived(
    new StandaloneActivityPoller(
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
    poller.abort();
  });

  let { children } = $props();
</script>

{#if error}
  <ErrorComponent {error} />
{:else}
  <StandaloneActivityLayout
    {poller}
    activityExecution={$activityExecution}
    {namespace}
    {activityId}
  >
    {@render children()}
  </StandaloneActivityLayout>
{/if}
