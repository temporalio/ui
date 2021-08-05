<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  import { page } from '$app/stores';
  import { pathMatches } from '$lib/utilities/path-matches';

  export let workflow: WorkflowExecution;

  $: href = workflow.url;
  $: isActive = pathMatches(href, $page.path);
</script>

<tr class:active={isActive}>
  <td>
    <a {href}>
      <h3>
        {workflow.name}
      </h3>
      <p>
        {workflow.runId}
      </p>
    </a>
  </td>
  <td>
    <a {href}>
      <WorkflowStatus status={workflow.status} />
    </a>
  </td>
  <td>
    <a {href}>
      <p>{workflow.startTime}</p>
    </a>
  </td>
  <td>
    <a {href}>
      <p>{workflow.endTime}</p>
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
