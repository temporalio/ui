<script lang="ts">
  import { type Snippet, untrack } from 'svelte';

  import {
    setWorkflowHistoryController,
    type WorkflowHistoryController,
  } from '$lib/services/workflow-history-controller.svelte.js';

  interface Props {
    controller: WorkflowHistoryController;
    children: Snippet;
  }

  const { controller, children }: Props = $props();

  setWorkflowHistoryController(untrack(() => controller));
</script>

{@render children()}
