<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { namespace } from '$lib/stores/namespace';
  import { page } from '$app/stores';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import { pathMatches } from '$lib/utilities/path-matches';
  import Time from '$lib/components/workflow-time.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  export let workflow: WorkflowExecution;
  export let timeFormat: string;

  $: href = getWorkflowExecutionUrl($namespace, workflow, $page.query);
  $: isActive = pathMatches(href, $page.path);
</script>

<tr class:active={isActive}>
  <td class="">
    <a sveltekit:noscroll {href}>
      <h3>
        {workflow.name}
      </h3>
    </a>
  </td>
  <td>
    <a sveltekit:noscroll {href}>
      <div class={`flex justify-center  `}>
        <WorkflowStatus status={workflow.status} />
      </div>
    </a>
  </td>
  <td>
    <a sveltekit:noscroll {href} class="font-mono text-right">
      <Time time={workflow.startTime} {timeFormat} />
    </a>
  </td>
  <td>
    <a sveltekit:noscroll {href} class="font-mono text-right">
      <Time time={workflow.endTime} {timeFormat} />
    </a>
  </td>
</tr>

<style lang="postcss">
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
    @apply w-full h-full block no-underline p-2;
  }

  .active {
    @apply bg-yellow-200;
  }

  .active:hover {
    @apply bg-yellow-200;
  }
  .run-id {
    font-size: 0.5rem;
  }
</style>
