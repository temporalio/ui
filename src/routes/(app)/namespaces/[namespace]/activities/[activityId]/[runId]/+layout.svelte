<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import ErrorComponent from '$lib/holocene/error.svelte';
  import StandaloneActivityLayout from '$lib/layouts/standalone-activity-layout.svelte';
  import {
    activityExecution,
    StandaloneActivityPoller,
  } from '$lib/utilities/standalone-activity-poller.svelte';

  import type { LayoutProps } from '../$types';

  let { params, children }: LayoutProps = $props();

  const namespace = $derived(params.namespace);
  const activityId = $derived(params.activityId);
  const runId = $derived(params.runId);

  let error = $state<Error | undefined>();

  const activityPollerAbortController = new AbortController();
  const poller = $derived(
    new StandaloneActivityPoller(
      namespace,
      activityId,
      runId,
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
</script>

{#if error}
  <ErrorComponent {error} />
{:else}
  <StandaloneActivityLayout
    {poller}
    activityExecution={$activityExecution}
    {namespace}
    {activityId}
    {runId}
  >
    {@render children()}
  </StandaloneActivityLayout>
{/if}
