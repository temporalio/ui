<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';
  import { shouldUseNewWorkflowTimeline } from '$lib/workflow-view/timeline/feature';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();

  const newTimelineEnabled = $derived(
    shouldUseNewWorkflowTimeline(page.url, page.route.id),
  );

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

{#if newTimelineEnabled}
  {@render children()}
{:else}
  <WorkflowRunLayout>
    {@render children()}
  </WorkflowRunLayout>
{/if}
