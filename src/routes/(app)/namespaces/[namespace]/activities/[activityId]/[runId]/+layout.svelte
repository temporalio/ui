<script lang="ts">
  import type { LayoutProps } from './$types';

  import StandaloneActivityLayout from '$lib/layouts/standalone-activity-layout.svelte';

  let { params, children }: LayoutProps = $props();

  const namespace = $derived(params.namespace);
  const activityId = $derived(params.activityId);
  const runId = $derived(params.runId);
</script>

<StandaloneActivityLayout {namespace} {activityId} {runId}>
  {@render children()}
</StandaloneActivityLayout>
