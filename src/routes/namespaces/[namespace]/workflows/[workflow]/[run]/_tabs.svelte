<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { page } from '$app/stores';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import { pathMatches } from '$lib/utilities/path-matches';

  const { namespace, workflow: id, run: runId } = $page.params;

  export let workflow: WorkflowExecution;

  $: workflowUrl = getWorkflowExecutionUrl(namespace, { id, runId });
  const historyEvents = workflow?.historyEvents;
</script>

<nav class="mt-6 px-6 flex">
  <a
    class:active={pathMatches(workflowUrl, $page.path, true)}
    href={workflowUrl}
  >
    History <span class="inline px-2">{historyEvents}</span>
  </a>
</nav>

<style lang="postcss">
  a {
    @apply block;
  }

  a.active {
    @apply border-b-2 rounded-b-sm border-primary font-medium;
  }

  span {
    background-color: #dce4fb;
    color: #124ae5;
  }
</style>
