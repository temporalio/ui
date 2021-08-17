<script lang="ts">
  import { page } from '$app/stores';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import { pathMatches } from '$lib/utilities/path-matches';
  import Time from '$lib/components/workflow-time.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let workflow: WorkflowExecution;
  export let relativeTime: boolean;

  $: href = getWorkflowExecutionUrl(workflow, $page.query);
  $: isActive = pathMatches(href, $page.path);
</script>

<tr class:active={isActive}>
  <td class="workflow">
    <a sveltekit:noscroll {href}>
      <h3>
        {workflow.name}
      </h3>
      <p>
        {workflow.id}
      </p>
      <p>
        {workflow.runId}
      </p>
    </a>
  </td>
  <td>
    <a sveltekit:noscroll {href}>
      <WorkflowStatus status={workflow.status} />
    </a>
  </td>
  <td>
    <a sveltekit:noscroll {href}>
      <Time time={workflow.startTime} {relativeTime} />
    </a>
  </td>
  <td>
    <a sveltekit:noscroll {href}>
      <Time time={workflow.endTime} {relativeTime} />
    </a>
  </td>
</tr>

<style lang="postcss">
  h3 {
    @apply font-normal m-0 text-base text-gray-900;
  }

  p {
    @apply m-0 text-gray-500 text-sm;
  }

  tr {
    @apply bg-gray-50;
  }

  tr:hover {
    @apply bg-gray-100;
  }

  td {
    @apply p-0;
  }

  td.workflow {
    @apply w-1/3;
  }

  a {
    @apply w-full h-full block no-underline p-6;
  }

  .active {
    @apply bg-yellow-200;
  }

  .active:hover {
    @apply bg-yellow-200;
  }
</style>
