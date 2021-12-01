<script lang="ts">
  import { page } from '$app/stores';

  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import { pathMatches } from '$lib/utilities/path-matches';

  const { namespace, workflow: id, run: runId } = $page.params;

  $: workflowUrl = getWorkflowExecutionUrl(namespace, { id, runId });
</script>

<nav class="mt-6 border-b-2 px-2 flex">
  <a
    class:active={pathMatches(workflowUrl, $page.path, true)}
    href={workflowUrl}
  >
    Summary
  </a>
</nav>

<style lang="postcss">
  a {
    @apply block px-4 py-4 mx-2;
  }

  a.active {
    @apply border-b-8 border-purple-400 font-bold;
  }
</style>
