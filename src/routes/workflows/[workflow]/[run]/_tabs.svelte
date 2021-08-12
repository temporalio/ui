<script lang="ts">
  import { page } from '$app/stores';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import { pathMatches } from '$lib/utilities/path-matches';

  export let workflow: WorkflowExecution;

  const workflowUrl = getWorkflowExecutionUrl(workflow);
  const summaryUrl = workflowUrl + '/summary';
  const eventsUrl = workflowUrl + '/events';
</script>

<nav class="mt-6 border-b-2 px-2 flex">
  <a class:active={pathMatches(summaryUrl, $page.path)} href={summaryUrl}
    >Summary</a
  >
  <a class:active={pathMatches(eventsUrl, $page.path)} href={eventsUrl}
    >Events</a
  >
</nav>

<style lang="postcss">
  a {
    @apply block px-4 py-4 mx-2;
  }

  a.active {
    @apply border-b-8 border-purple-400 font-bold;
  }
</style>
