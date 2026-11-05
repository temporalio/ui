<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';

  import WorkflowHistoryScope from './workflow-history-scope.svelte';

  interface Props {
    controller: WorkflowHistoryController;
    children: Snippet;
  }

  const { controller, children }: Props = $props();
</script>

{#key controller}
  <WorkflowHistoryScope {controller} {children} />
{/key}
