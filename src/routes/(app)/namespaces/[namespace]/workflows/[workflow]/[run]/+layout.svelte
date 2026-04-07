<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  interface Props {
    children: Snippet;
  }
  let { children }: Props = $props();

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout>
  {@render children()}
</WorkflowRunLayout>
