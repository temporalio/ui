<script lang="ts">
  import type { LayoutProps } from './$types';

  import StandaloneActivityLayout from '$lib/layouts/standalone-activity-layout.svelte';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  let { params, children }: LayoutProps = $props();

  const namespace = $derived(params.namespace);
  const activityId = $derived(params.activityId);
  const runId = $derived(params.runId);
</script>

<StandaloneActivityLayout
  activityExecution={$activityExecution}
  {namespace}
  {activityId}
  {runId}
>
  {@render children()}
</StandaloneActivityLayout>
