<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { LayoutProps } from './$types';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  let { children }: LayoutProps = $props();

  onDestroy(() => {
    clearPreviousEventParameters();
  });
</script>

<WorkflowRunLayout>
  {@render children()}
</WorkflowRunLayout>
